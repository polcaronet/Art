import { Component } from '@angular/core';

@Component({
  selector: 'app-privacy',
  standalone: true,
  template: `
    <div class="page">
      <h1>Política de Privacidade</h1>
      <p class="updated">Última atualização: Abril de 2026</p>

      <section>
        <h2>1. Dados Coletados</h2>
        <p>Coletamos apenas os dados necessários para processar suas compras e melhorar sua experiência: nome, e-mail, dados de pagamento (processados por terceiros) e histórico de pedidos.</p>
      </section>

      <section>
        <h2>2. Uso dos Dados</h2>
        <p>Seus dados são utilizados exclusivamente para: processar pedidos e pagamentos, enviar atualizações sobre seus pedidos, melhorar nossos serviços e cumprir obrigações legais.</p>
      </section>

      <section>
        <h2>3. Compartilhamento</h2>
        <p>Não vendemos seus dados. Compartilhamos apenas com processadores de pagamento (Mercado Pago e Stripe) para concluir transações, e com serviços de hospedagem (Firebase) para armazenamento seguro.</p>
      </section>

      <section>
        <h2>4. Segurança</h2>
        <p>Utilizamos criptografia e práticas de segurança para proteger seus dados. Pagamentos são processados diretamente pelos gateways (Mercado Pago/Stripe), sem armazenar dados de cartão em nossos servidores.</p>
      </section>

      <section>
        <h2>5. Cookies</h2>
        <p>Utilizamos cookies para manter sua sessão, preferências de tema e itens do carrinho. Você pode desativá-los nas configurações do navegador.</p>
      </section>

      <section>
        <h2>6. Seus Direitos (LGPD)</h2>
        <p>Conforme a Lei Geral de Proteção de Dados, você tem direito a: acessar seus dados, corrigir informações, solicitar exclusão da conta e portabilidade dos dados. Entre em contato pelo e-mail do artista para exercer seus direitos.</p>
      </section>

      <section>
        <h2>7. Contato</h2>
        <p>Para dúvidas sobre privacidade, entre em contato através do nosso LinkedIn ou WhatsApp disponível no site.</p>
      </section>
    </div>
  `,
  styles: [`
    .page { max-width: 700px; margin: 2rem auto; }
    h1 { font-size: 1.8rem; margin-bottom: 0.3rem; }
    .updated { color: var(--text-secondary); margin-bottom: 2rem; font-size: 0.85rem; }
    section { margin-bottom: 1.5rem; }
    h2 { font-size: 1.1rem; margin-bottom: 0.5rem; color: var(--border-color); }
    p { color: var(--text-secondary); line-height: 1.7; font-size: 0.95rem; }
  `],
})
export class PrivacyComponent { }
