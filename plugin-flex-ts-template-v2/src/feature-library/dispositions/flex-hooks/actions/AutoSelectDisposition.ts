import * as Flex from '@twilio/flex-ui';

import { getDispositionsForQueue } from '../../config';
import AppState from '../../../../types/manager/AppState';
import { reduxNamespace } from '../../../../utils/state';
import { DispositionsState, updateDisposition } from '../states';
import { FlexActionEvent, FlexAction } from '../../../../types/feature-loader';
import { getMatchingTaskConfiguration } from '../../../agent-automation/config';

export const actionEvent = FlexActionEvent.before;
export const actionName = FlexAction.CompleteTask;

export const actionHook = function autoSelectDispositionOnWrapupTimeout(flex: typeof Flex, manager: Flex.Manager) {
    flex.Actions.addListener(`${actionEvent}${actionName}`, async (payload, _abortFunction) => {
        if (!payload.task?.taskSid) {
            return;
        }

        const task = payload.task;
        const queueSid = task.queueSid;
        const queueName = task.queueName;
        const taskSid = task.taskSid;

        // Solo proceder si la task está en wrapup
        if (!Flex.TaskHelper.isInWrapupMode(task)) {
            return;
        }

        // Verificar si ya tiene disposición seleccionada
        const { tasks } = (manager.store.getState() as AppState)[reduxNamespace].dispositions as DispositionsState;
        const taskDisposition = tasks[taskSid];

        if (taskDisposition?.disposition) {
            // Ya tiene disposición, no hacer nada
            return;
        }

        // Obtener configuración de wrapup tiempo desde agent-automation
        const taskConfig = getMatchingTaskConfiguration(task);
        const wrapupTimeMs = taskConfig?.wrapup_time || 120000; // Default 2 minutos si no hay config

        // CLAVE: Detectar si es auto-complete por timeout vs manual por agente
        // Calcular tiempo transcurrido desde que entró en wrapup
        const wrapupStartTime = task.dateUpdated.getTime();
        const currentTime = new Date().getTime();
        const timeInWrapup = currentTime - wrapupStartTime;

        // Usar tiempo real configurado menos 5 segundos como threshold
        const THRESHOLD_BUFFER = 5000; // 5 segundos
        const WRAPUP_TIMEOUT_THRESHOLD = wrapupTimeMs - THRESHOLD_BUFFER;

        if (timeInWrapup >= WRAPUP_TIMEOUT_THRESHOLD) {
            // Es auto-complete por timeout → Auto-seleccionar disposición
            const dispositions = getDispositionsForQueue(queueSid, queueName);

            if (dispositions.length > 0) {
                console.log(`🤖 Auto-seleccionando disposición por timeout de wrapup (${wrapupTimeMs}ms - ${THRESHOLD_BUFFER}ms = ${WRAPUP_TIMEOUT_THRESHOLD}ms):`, dispositions[0]);
                manager.store.dispatch(updateDisposition({ taskSid, value: dispositions[0] }));
            }
        }
        // Si timeInWrapup < threshold → Es complete manual → No hacer nada
        // Dejar que el hook de validación existente (CompleteTask.ts) lo bloquee
    });
};