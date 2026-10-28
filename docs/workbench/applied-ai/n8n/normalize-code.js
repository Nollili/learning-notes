// n8n Code node body, Run Once for All Items. Plain JSON fixtures only.
// No network, credentials, user-supplied expressions or owner fields.
const items = $input.all();
if (!Array.isArray(items) || items.length > 20) throw new Error('ITEM_BUDGET');
return items.map((item, index) => {
  const value = item?.json?.body;
  const object = value !== null && typeof value === 'object' && !Array.isArray(value);
  const keys = object ? Object.keys(value).sort().join(',') : '';
  const valid = object && keys === 'action,event_id,revision,source_id'
    && typeof value.event_id === 'string' && /^[a-z0-9_-]{1,64}$/.test(value.event_id)
    && typeof value.source_id === 'string' && /^[a-z0-9_-]{1,64}$/.test(value.source_id)
    && Number.isSafeInteger(value.revision) && value.revision >= 1 && value.revision <= 1000000
    && value.action === 'refresh';
  return {
    json: valid ? { accepted: true, event: {
      event_id: value.event_id, source_id: value.source_id,
      revision: value.revision, action: value.action,
    } } : { accepted: false, code: 'invalid_event' },
    pairedItem: { item: index },
  };
});
