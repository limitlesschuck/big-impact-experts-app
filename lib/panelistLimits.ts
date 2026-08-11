// Not a schema or API-level constraint -- just a shared guard rail value
// used by every place that adds panelists (new-event form, CSV import,
// and the edit page's add-panelist flow), so raising it later means
// changing one number instead of hunting down every place it's checked.
export const MAX_PANELISTS_PER_EVENT = 25;
