import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <app-header />
    <main class="container">
      <router-outlet />
    </main>
    <app-footer />
  `,
  styles: [
    `
      .container {
        max-width: 1080px;
        margin: 0 auto;
        padding: 1rem;
        min-height: calc(100vh - 130px);
        box-sizing: border-box;
        overflow-x: hidden;
      }
      .container > * {
        display: block;
        width: 100%;
      }
    `,
  ],
})
export class AppComponent implements OnInit {
  private auth = inject(AuthService);

  ngOnInit() {
    // Cria sessão anônima temporária para visitantes
    this.auth.loginAnonymous();
  }
}
