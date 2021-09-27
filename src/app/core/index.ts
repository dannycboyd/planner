export * from './interfaces/enums';
export * from './transforms/date.transform';
export * from './utils';

import { DateTransformer } from './transforms/date.transform';

export let AppTransforms = [
  DateTransformer
]

// import { calView } from './interfaces/enums';

// export let CoreEnums = [ // i don't think this is necessary, not a component, not imported into the app module.
//   calView
// ]