# Search Weather

Sistema Full Stack para consulta de condições climáticas em tempo real, desenvolvido utilizando FastAPI, PostgreSQL e JavaScript puro. A aplicação permite pesquisar cidades, visualizar informações meteorológicas atualizadas, gerenciar favoritos, histórico de pesquisas e alertas climáticos através de uma interface moderna integrada a uma API REST.

---

# Deploy

### Frontend

https://search-weather-front-production.up.railway.app

### Backend (API)

https://search-weather-back-production.up.railway.app

### Documentação da API (Swagger)

https://search-weather-back-production.up.railway.app/docs

### Repositório

https://github.com/gabriel01283/Search-Weather

---

# Tecnologias

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Railway](https://img.shields.io/badge/Railway-13111C?style=for-the-badge&logo=railway&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

---

# Sobre o Projeto

O **Search Weather** é uma plataforma web que fornece consultas meteorológicas em tempo real através da integração com uma API climática externa.

Além da consulta do clima, o sistema oferece recursos completos de gerenciamento de usuários, autenticação via JWT, histórico de pesquisas, favoritos e alertas personalizados.

Toda a aplicação foi construída utilizando uma arquitetura cliente-servidor, onde o frontend realiza requisições HTTP para uma API REST desenvolvida em FastAPI.

---

# Principais Funcionalidades

## Consulta Climática

- Consulta de clima em tempo real
- Pesquisa por país
- Pesquisa por estado (opcional)
- Pesquisa por cidade
- Exibição da temperatura atual
- Sensação térmica
- Umidade do ar
- Velocidade do vento
- Condição climática

---

## Sistema de Usuários

- Cadastro de usuários
- Login seguro
- Autenticação utilizando JWT
- Rotas protegidas

---

## Histórico

Cada pesquisa realizada é registrada automaticamente.

O usuário pode:

- visualizar histórico completo
- pesquisar dentro do histórico
- excluir pesquisas individuais
- limpar todo o histórico

---

## Favoritos

- adicionar cidades favoritas
- remover favoritos
- listar favoritos
- verificar se uma cidade já está favoritada

---

## Alertas Climáticos

O sistema permite gerenciar alertas personalizados relacionados às cidades cadastradas pelo usuário.

---

# Características do Sistema

## Arquitetura

```
                 Frontend
                     │
                     │ HTTP
                     ▼
          FastAPI REST API
                     │
     ┌───────────────┼───────────────┐
     │               │               │
     ▼               ▼               ▼
 Usuários      Histórico      Favoritos
     │
     ▼
 PostgreSQL
     │
     ▼
OpenWeather API
```

---

# Tecnologias Utilizadas

## Frontend

- HTML5
- CSS3
- JavaScript

---

## Backend

- Python
- FastAPI
- Pydantic
- Psycopg2
- JWT Authentication

---

## Banco de Dados

- PostgreSQL

---

## Deploy

- Railway

---

## API Externa

- OpenWeather API

---

# Estrutura do Projeto

```
Search-Weather
│
├── backEnd
│   ├── alerts
│   ├── auth
│   ├── cities
│   ├── database
│   ├── favorites
│   ├── history
│   ├── users
│   ├── weather
│   ├── main.py
│   └── railway.json
│
├── frontEnd
│   ├── parteCSS
│   ├── parteHTML
│   └── parteJS
│
├── img
│
├── Dockerfile.front
├── requirements.txt
└── README.md
```

---

# Endpoints da API

## Usuários

- Cadastro
- Login

---

## Clima

- Consulta climática

---

## Histórico

- Listar histórico
- Buscar histórico
- Excluir pesquisa
- Limpar histórico

---

## Favoritos

- Adicionar favorito
- Remover favorito
- Listar favoritos
- Verificar favorito

---

## Alertas

- Criar alerta
- Atualizar alerta
- Listar alertas
- Excluir alerta

---

# Segurança

O sistema utiliza autenticação baseada em **JWT (JSON Web Token)**.

Após realizar o login, o usuário recebe um token que deve ser enviado no cabeçalho das requisições protegidas.

Exemplo:

```http
Authorization: Bearer <token>
```

---

# Instruções de Execução

## Pré-requisitos

- Python 3.12+
- PostgreSQL
- Git

---

## Clonar o projeto

```bash
git clone https://github.com/gabriel01283/Search-Weather.git
```

```bash
cd Search-Weather
```

---

## Criar ambiente virtual

### Windows

```bash
python -m venv venv
```

```bash
venv\Scripts\activate
```

### Linux

```bash
python3 -m venv venv
```

```bash
source venv/bin/activate
```

---

## Instalar dependências

```bash
pip install -r requirements.txt
```

---

## Configurar variáveis de ambiente

Criar um arquivo:

```
.env
```

Exemplo:

```env
DATABASE_URL=seu_banco
SECRET_KEY=sua_chave
OPENWEATHER_API_KEY=sua_api_key
```

---

## Executar o Backend

```bash
uvicorn backEnd.main:app --reload
```

A API estará disponível em:

```
http://127.0.0.1:8000
```

---

## Executar o Frontend

Abra o arquivo:

```
frontEnd/parteHTML/index.html
```

ou utilize um servidor HTTP local.


# Desenvolvedor

## Gabriel Saraiva Sampaio

Estudante de Engenharia de Software.
