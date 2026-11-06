# Landing Page Pão de Mestre

Site institucional da **Pão de Mestre — Padaria e Conveniência**, desenvolvido como uma landing page responsiva para apresentar a padaria, seus produtos, avaliações de clientes, endereços e horários de funcionamento.

## Demonstração online

Acesse o site publicado: [paodemestre.vercel.app](https://paodemestre.vercel.app).

## Integrantes

- Gabriel José dos Santos Xavier
- Romeu Vilela de Farias S. A.
- Vinicius Araujo Coelho
- José Ray Barros Nunes
- Rangel Farias Marques

## Sobre o projeto

A página reúne as principais informações da Pão de Mestre em uma única experiência, com navegação para as seções de início, catálogo, avaliações, sobre a padaria e contato. O layout se adapta a celulares e telas maiores.

## Recursos

- Catálogo visual com fotos e descrições dos itens e espaços apresentados.
- Carrossel infinito de avaliações, com navegação por setas e indicadores.
- Menu de navegação responsivo com botão hamburguer em telas pequenas.
- Informações de endereço, horário de funcionamento e acesso ao Instagram.
- Ícones SVG incluídos diretamente no HTML.
- Suporte à preferência do sistema por movimento reduzido.

## Tecnologias

- HTML5
- CSS3
- JavaScript puro

O projeto não usa frameworks, backend ou banco de dados. As fontes DM Sans e Playfair Display são carregadas do Google Fonts; sem conexão, serão usadas as fontes alternativas definidas no CSS.

## Estrutura

```text
.
├── index.html
└── assets/
    ├── css/
    │   └── styles.css
    ├── img/
    │   └── fotos do catálogo e da padaria
    └── js/
        └── script.js
```

## Como visualizar

Abra `index.html` em um navegador. Para uma visualização local, também é possível iniciar um servidor estático na pasta do projeto e acessar o endereço local indicado pelo servidor.

> **Observação sobre imagens:** as fotos do catálogo estão em `assets/img`. O HTML também referencia `logo.webp` e `mesa-padaria.webp`; inclua esses arquivos nessa pasta para exibir a marca e a imagem principal do início.
