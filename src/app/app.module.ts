import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { Components } from './components';
import { AppServices } from './services';

@NgModule({
  declarations: [
    AppComponent,
    ...Components
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [AppServices],
  bootstrap: [AppComponent]
})
export class AppModule { }
