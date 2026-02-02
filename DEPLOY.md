# Instruções de Deploy (Hostinger / Apache)

O build do seu projeto foi gerado com sucesso na pasta `dist`.

## Como subir para a Hostinger:

1.  **Acesse o Gerenciador de Arquivos** da Hostinger (ou use um cliente FTP como FileZilla).
2.  Navegue até a pasta **public_html** do seu domínio.
3.  **Apague** qualquer arquivo padrão que estiver lá (se houver).
4.  **Upload**:
    *   Pegue **TODOS** os arquivos e pastas que estão dentro da pasta `dist` no seu computador (c:\Users\lepps\Desktop\Projetos - DEV\Hashi Dashboard\gestaohashi\dist).
    *   Arraste-os para dentro da `public_html`.
5.  **Verifique**:
    *   Certifique-se de que o arquivo `.htaccess` (que está na pasta `dist`) também foi copiado. Ele é essencial para que a navegação do site funcione corretamente.

## Conteúdo da pasta `dist`:
*   `assets/` (Pasta com estilos e scripts)
*   `index.html` (Arquivo principal)
*   `.htaccess` (Configuração para o servidor)

Seu site deve estar no ar assim que o upload terminar!
