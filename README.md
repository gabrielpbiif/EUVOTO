# Eu Voto · André 13567 e Lindbergh 1300

Site estático com duas abas: (1) card "EU VOTO! NESSES CANDIDATOS" — foto no círculo + 3 cores; (2) colinha fixa: Lindbergh 1300, André 13567, Benedita 131, Pedro Paulo 555, Paes 55 e Lula 13. Tem também a chamada pra votar no domingo e a mensagem pronta pra copiar.

- Foto nunca sai do aparelho (montagem no navegador). Sem backend, sem rastreadores.
- `vercel.json` com cabeçalhos de segurança (CSP, anti-iframe, HSTS, nosniff, no-referrer).
- Modelos em `img/vermelho.webp`, `img/azul.webp`, `img/amarelo.webp` (1100×1600, círculo transparente).

Deploy: Vercel → Add New Project → importar o repositório → Framework **Other** → Deploy.
