export * from './api-service/api.service';
export * from './context.service';

import { ApiService } from './api-service/api.service';
import { ContextService } from './context.service';

export const AppServices = [
  ApiService,
  ContextService
]