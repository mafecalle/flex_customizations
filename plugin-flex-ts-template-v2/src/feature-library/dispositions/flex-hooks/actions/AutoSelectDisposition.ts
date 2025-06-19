import * as Flex from '@twilio/flex-ui';

import { getDispositionsForQueue } from '../../config';
import AppState from '../../../../types/manager/AppState';
import { reduxNamespace } from '../../../../utils/state';
import { DispositionsState, updateDisposition } from '../states';
import { FlexActionEvent, FlexAction } from '../../../../types/feature-loader';

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

        // CLAVE: Detectar si es auto-complete por timeout vs manual por agente
        // Calcular tiempo transcurrido desde que entró en wrapup
        const wrapupStartTime = task.dateUpdated.getTime();
        const currentTime = new Date().getTime();
        const timeInWrapup = currentTime - wrapupStartTime;

        // Si han pasado más de 115 segundos (cerca de los 120s de timeout), 
        // asumir que es auto-complete por timeout del sistema
        const WRAPUP_TIMEOUT_THRESHOLD = 115000; // 115 segundos

        if (timeInWrapup >= WRAPUP_TIMEOUT_THRESHOLD) {
            // Es auto-complete por timeout → Auto-seleccionar disposición
            const dispositions = getDispositionsForQueue(queueSid, queueName);

            if (dispositions.length > 0) {
                console.log('🤖 Auto-seleccionando disposición por timeout de wrapup:', dispositions[0]);
                manager.store.dispatch(updateDisposition({ taskSid, value: dispositions[0] }));
            }
        }
        // Si timeInWrapup < 115s → Es complete manual → No hacer nada
        // Dejar que el hook de validación existente (CompleteTask.ts) lo bloquee
    });
};