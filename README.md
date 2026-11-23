# Raising Dogs — website institucional

Site estático (HTML + CSS + JavaScript, sem dependências). Basta abrir `index.html` ou alojar a pasta num servidor.

## Estrutura
```
index.html               Homepage (9 secções)
assets/css/style.css     Estilos — tokens de cor/tipografia no topo (:root)
assets/js/main.js        Menu mobile, header sticky, animações, filtros, lightbox, formulário
assets/img/              Fotografias em WebP (versão 800px + versão grande)
api/contact.php          Envio do formulário por email (opcional, requer PHP)
```

## Antes de publicar
1. **Contactos**: substituir os placeholders entre `[ ]` (telefone, email, morada) no `index.html` (secção Contactos e rodapé) e os `href` de `tel:`/`mailto:`.
2. **Redes sociais**: preencher os `href="#"` dos ícones Instagram/Facebook.
3. **Logótipo**: o símbolo `#logo-mark` é provisório — substituir pelo logótipo oficial (SVG).
4. **Serviços**: confirmar com a empresa “Outros serviços” (Pet Sitting, Dog Walking, Pet Taxi) e “Tratamentos de manutenção e estética”; remover o que não estiver disponível.
5. **Fotografias**: as imagens são de demonstração (Unsplash / rawpixel CC0 / WordPress Photo Directory CC0). Substituir pelas fotografias reais, mantendo os nomes ou atualizando `src`/`srcset`/`alt`.
6. **Formulário**: definir `CONFIG.formEndpoint` em `main.js` — `'api/contact.php'` (editar os emails no ficheiro) ou o URL de um serviço como Formspree/Web3Forms. Sem endpoint, o envio é apenas simulado.
7. **Política de Privacidade**: `politica-de-privacidade.html` é um texto-modelo (RGPD). Rever e validar com a Raising Dogs antes de publicar.
