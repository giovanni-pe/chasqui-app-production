import { watch } from 'vue';
import { mqttService } from '@/lib/mqtt';

/**
 * Synchronizes a Pinia store field with MQTT (generic, bidirectional, debug-friendly).
 * @param store         Pinia store (e.g. useChatStore())
 * @param stateKey      Field to sync (e.g. 'messages')
 * @param topic         MQTT topic (e.g. 'app/trip/123/chat')
 * @param localUserId   Local user ID
 * @param options       Optional: remoteUserId, meta, type
 */
export function syncRemoteMqttState(
  store: any,
  stateKey: string,
  topic: string,
  localUserId: string,
  options: {
    remoteUserId?: string,
    meta?: Record<string, any>,
    type?: string,
  } = {}
) {
  let ignoreNext = false;

  // 1. Publish local changes to MQTT
  watch(
    () => store[stateKey],
    (newVal) => {
      if (ignoreNext) {
        // Debug: Prevent feedback loop
        console.debug(`[MQTT][${topic}] Skipping publish (feedback prevention)`);
        return;
      }
      const payload = {
        localUserId,
        remoteUserId: options.remoteUserId,
        updatedAt: Date.now(),
        value: newVal,
        meta: options.meta,
        type: options.type
      };
      console.debug(`[MQTT][${topic}] Publishing change:`, payload);
      mqttService.publish(topic, JSON.stringify(payload));
    },
    { deep: true }
  );

  // 2. Listen for and apply remote changes
  mqttService.subscribe(topic, (message: any) => {
    try {
      // Debug: On message received
      console.debug(`[MQTT][${topic}] Message received:`, message);

      // Parse payload from Buffer, Uint8Array, or string
      const payloadStr = typeof message.payload === 'string'
        ? message.payload
        : new TextDecoder().decode(message.payload);

      const payload = JSON.parse(payloadStr);

      // Debug: Parsed payload
      console.debug(`[MQTT][${topic}] Parsed payload:`, payload);

      // Skip if from self
      if (payload.localUserId === localUserId) {
        console.debug(`[MQTT][${topic}] Ignoring own message (localUserId match)`);
        return;
      }
      // Skip if filtering by remoteUserId and does not match
      if (options.remoteUserId && payload.localUserId !== options.remoteUserId) {
        console.debug(`[MQTT][${topic}] Ignoring message (remoteUserId mismatch)`);
        return;
      }
      ignoreNext = true;
      store[stateKey] = payload.value;
      ignoreNext = false;
      // Debug: Change applied to store
      console.debug(`[MQTT][${topic}] State updated!`, stateKey, '=', payload.value);
    } catch (e) {
      console.warn('[syncRemoteMqttState] Error parsing payload:', e, message);
    }
  });

  // Debug: Subscribed to topic
  console.debug(`[MQTT][${topic}] Subscribed for bidirectional sync on "${stateKey}"`);
}
