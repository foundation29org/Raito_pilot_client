import * as $ from 'jquery';
import { NgModule, LOCALE_ID } from "@angular/core";
import es from '@angular/common/locales/es'
import fr from '@angular/common/locales/fr'
import de from '@angular/common/locales/de'
import it from '@angular/common/locales/it'
import pt from '@angular/common/locales/pt'
import { registerLocaleData } from '@angular/common';
registerLocaleData(es);
registerLocaleData(fr);
registerLocaleData(de);
registerLocaleData(it);
registerLocaleData(pt);
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { ToastrModule } from "ngx-toastr";
import { HttpClient, HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { environment } from 'environments/environment';

import { AppRoutingModule } from "./app-routing.module";
import { SharedModule } from "./shared/shared.module";
import { AppComponent } from "./app.component";
import { ContentLayoutComponent } from "./layouts/content/content-layout.component";
import { FullLayoutComponent } from "./layouts/full/full-layout.component";
import { LandPageLayoutComponent } from "./layouts/land-page/land-page-layout.component";

import { AuthService } from "./shared/auth/auth.service";
import { AuthGuard } from "./shared/auth/auth-guard.service";
import { RoleGuard } from './shared/auth/role-guard.service';
import { TokenService } from './shared/auth/token.service';
import { WINDOW_PROVIDERS } from './shared/services/window.service';
import { SortService } from 'app/shared/services/sort.service';
import { EventsService } from 'app/shared/services/events.service';
import { DatePipe } from '@angular/common';
import { DateService } from 'app/shared/services/date.service';
import { SearchService } from 'app/shared/services/search.service';
import { BlobStorageService } from 'app/shared/services/blob-storage.service';
import { LocalizedDatePipe } from 'app/shared/services/localizedDatePipe.service';
import { HighlightSearch } from 'app/shared/services/search-filter-highlight.service';
import { SearchFilterPipe } from 'app/shared/services/search-filter.service';
import { Data } from 'app/shared/services/data.service';
import { CordovaService } from 'app/shared/services/cordova.service';
import { TrackEventsService } from 'app/shared/services/track-events.service';
import { AuthInterceptor } from './shared/auth/auth.interceptor';
import { AuthServiceFirebase } from "./shared/services/auth.service.firebase";

import { QRCodeComponent } from 'angularx-qrcode';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}

@NgModule({ declarations: [AppComponent, FullLayoutComponent, ContentLayoutComponent, LandPageLayoutComponent, SearchFilterPipe, HighlightSearch, LocalizedDatePipe],
    bootstrap: [AppComponent], imports: [CommonModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        SharedModule,
        ToastrModule.forRoot(),
        NgbModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: createTranslateLoader,
                deps: [HttpClient]
            }
        }),
        QRCodeComponent,
        AngularFireModule.initializeApp(environment.firebase),
        AngularFireAuthModule], providers: [
        AuthService,
        TokenService,
        AuthGuard,
        RoleGuard,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true
        },
        WINDOW_PROVIDERS,
        { provide: LOCALE_ID, useValue: 'es-ES' },
        SortService,
        EventsService,
        DatePipe,
        DateService,
        SearchService,
        TrackEventsService,
        BlobStorageService,
        HighlightSearch,
        LocalizedDatePipe,
        SearchFilterPipe,
        Data,
        CordovaService,
        AuthServiceFirebase,
        provideHttpClient(withInterceptorsFromDi())
    ] })
export class AppModule {}
