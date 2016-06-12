import { bootstrap } from '@angular/platform-browser-dynamic';
import { HTTP_PROVIDERS } from '@angular/http';

import { MoscropApp } from './moscrop-app.component';

bootstrap(MoscropApp, [HTTP_PROVIDERS]);
