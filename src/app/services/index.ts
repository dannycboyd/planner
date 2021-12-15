export * from './api-service/api.service';
export * from './context.service';
export * from './data.service';
export * from './hotkeys.service';

import { ApiService } from './api-service/api.service';
import { ContextService } from './context.service';
import { DataService } from './data.service';
import { HotkeysService } from './hotkeys.service';

export const AppServices = [
  ApiService,
  ContextService,
  DataService,
  HotkeysService
]