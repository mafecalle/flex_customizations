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

        // Solo proceder si la task está en wrapup (auto-complete por timeout)
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

        // Obtener disposiciones disponibles para esta cola
        const dispositions = getDispositionsForQueue(queueSid, queueName);

        if (dispositions.length > 0) {
            // Auto-seleccionar la primera disposición
            console.log('🤖 Auto-seleccionando disposición por timeout de wrapup:', dispositions[0]);
            manager.store.dispatch(updateDisposition({ taskSid, value: dispositions[0] }));
        }
    });
}; 