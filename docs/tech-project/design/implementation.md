## 🏗️ **Arquitetura Geral**

**Frontend:**  
- **Framework:** React.js (Next.js recomendado para SSR + SEO)
- **Login:** Google OAuth via Firebase Auth ou Auth0 (sem senha, seguro)
- **Chamada de API:** via Axios ou Fetch para a API NestJS  
- **Design System:** TailwindCSS + Shadcn/UI

**Backend (API):**  
- **Framework:** NestJS  
- **Auth:** JWT + OAuth2 (Google)  
- **Validação:** class-validator, Joi  
- **Controle de acesso:** Guard + Role Middleware  
- **Admin Interface:** Painel interno usando Next.js ou ferramenta tipo Retool/Plasmic

**Banco de Dados:**  
- **Supabase (PostgreSQL)**  
- Supabase também lida com:
  - **Storage** (imagens e QR codes)
  - **Realtime listeners** (para filas/inscrições em tempo real)

---

## 🔐 **Segurança (Security Best Practices)**

- **Validação de input**: via DTOs com `class-validator` no NestJS  
- **Tamanho de campos**: definidos abaixo para evitar SQL injection e buffer overflow  
- **Escapando queries**: via TypeORM ou Prisma  
- **Rate limiting**: para endpoints sensíveis como login, inscrição  
- **Autenticação JWT**: tokens com expiração curta (15min) + refresh token  
- **Authorization**: roles (`admin`, `user`, `iconic`) via guards  
- **Storage seguro**: upload de imagens com verificação de tipo MIME e limites de tamanho (ex: 2MB)

---

## 🧾 **Database Models**

### 🧑‍💼 `users`
| Field             | Type              | Description |
|------------------|-------------------|-------------|
| `id`             | UUID (PK)         | Unique user ID |
| `full_name`      | VARCHAR(100)      | Nome completo |
| `email`          | VARCHAR(150), UNIQUE | Validado com OAuth |
| `phone_number`   | VARCHAR(20)       | Formato internacional |
| `instagram`      | VARCHAR(100)      | Optional |
| `profile_picture_url` | TEXT         | URL do Supabase |
| `bio`            | TEXT (max 500)    | Descrição pessoal |
| `show_public_profile` | BOOLEAN DEFAULT false | Se perfil é visível |
| `is_iconic`      | BOOLEAN DEFAULT false | Se é usuário ICONIC |
| `iconic_expires_at` | TIMESTAMP NULLABLE | Validade do título |
| `created_at`     | TIMESTAMP         | Auto |
| `updated_at`     | TIMESTAMP         | Auto |

---

### 🎉 `events`
| Field             | Type              | Description |
|------------------|-------------------|-------------|
| `id`             | UUID (PK)         | ID único |
| `title`          | VARCHAR(120)      | Nome do evento |
| `description`    | TEXT              | Detalhes |
| `location`       | VARCHAR(200)      | Local |
| `date`           | DATE              | Data do evento |
| `time`           | TIME              | Horário |
| `category`       | ENUM: `'party'`, `'drop'`, `'dinner'`, `'fashion_show'`, `'other'` | Tipo do evento |
| `is_exclusive`   | BOOLEAN           | Apenas para usuários ICONIC |
| `is_public`      | BOOLEAN DEFAULT false | Se é aberto a todos (ainda precisa inscrição) |
| `max_attendees`  | INT               | Capacidade máxima |
| `partner_name`   | VARCHAR(100) NULLABLE | Marca, se houver |
| `partner_logo_url` | TEXT NULLABLE   | URL da logo |
| `cover_image_url` | TEXT              | Imagem principal |
| `created_at`     | TIMESTAMP         | Auto |

---

### 📥 `event_participations`
| Field             | Type              | Description |
|------------------|-------------------|-------------|
| `id`             | UUID (PK)         | ID único |
| `user_id`        | UUID (FK → users) | Quem se inscreveu |
| `event_id`       | UUID (FK → events)| Evento |
| `status`         | ENUM: `'confirmed'`, `'cancelled'` | Situação da inscrição |
| `created_at`     | TIMESTAMP         | Timestamp da inscrição |
| `cancelled_at`   | TIMESTAMP NULLABLE| Se cancelou |

---

### 🛂 `event_checkins`
| Field             | Type              | Description |
|------------------|-------------------|-------------|
| `id`             | UUID              | Check-in ID |
| `event_id`       | UUID              | Evento |
| `user_id`        | UUID              | Quem fez check-in |
| `qr_token`       | VARCHAR(64), UNIQUE | Token único para QR |
| `scanned_by_admin_id` | UUID (FK)     | Quem autorizou |
| `checkin_time`   | TIMESTAMP         | Hora do check-in |

---

## 🔑 **Login com Google**

- **Firebase Auth** ou **Auth0** com OAuth2
- No frontend, o usuário entra com Google → você recebe `id_token` → backend verifica e cria sessão
- JWT assinado para manter a sessão

---

## 🎟️ **QR Code Exclusivo**

- Após inscrição confirmada:
  - Backend gera token único (`qr_token`)
  - Salvo em `event_checkins` com estado pendente
  - QR gerado (pode usar `qrcode` lib no backend ou direto no frontend)
  - No dia do evento, admin escaneia QR → verifica token → registra `checkin_time`
  - **Tokens expiram após o horário do evento**

---

## 📂 **Supabase Storage**

- Pasta `avatars/` → imagens de perfil  
- Pasta `event_banners/` → imagens dos eventos  
- Pasta `qr_codes/` → imagens dos QR codes (opcional)  
- Use `public` read apenas se necessário, caso contrário, tokens assinados para leitura temporária.

---

## ⚙️ Exemplo de Flow para Evento

1. Usuário entra com Google (OAuth)  
2. Responde questionário → recebe match com eventos  
3. Se evento for público: pode se inscrever  
4. Se for exclusivo: só se `is_iconic = true`  
5. Ao se inscrever: gera QR  
6. No dia do evento: QR é escaneado e validado pelo admin  
7. Registro é salvo em `event_checkins`

Claro! Aqui está o **diagrama ER (Entidade-Relacionamento) escrito** da arquitetura do ICONIC, com os relacionamentos bem definidos. Isso te ajuda tanto para modelagem no Supabase quanto para implementar as entidades no NestJS.

---

## 🧠 **Entidades e Relacionamentos**

---

### **1. `users`**
- **PK:** `id`
- Pode ter **muitas** participações em eventos (`event_participations`)
- Pode ter **muitos** check-ins em eventos (`event_checkins`)

---

### **2. `events`**
- **PK:** `id`
- Pode ter **muitas** participações (`event_participations`)
- Pode ter **muitos** check-ins (`event_checkins`)
- Pode ser vinculado a uma marca (dados opcionais dentro da própria tabela)

---

### **3. `event_participations`**
- **PK:** `id`
- **FK:** `user_id` → `users.id`
- **FK:** `event_id` → `events.id`
- Representa a **inscrição** de um usuário em um evento
- Tem status (`confirmed` ou `cancelled`)

---

### **4. `event_checkins`**
- **PK:** `id`
- **FK:** `user_id` → `users.id`
- **FK:** `event_id` → `events.id`
- **FK:** `scanned_by_admin_id` → `admin_users.id` (quem autorizou o acesso)
- Representa o **registro de presença (check-in)** em um evento

---

### **5. `admin_users`**
- **PK:** `id`
- Pode ter escaneado **muitos** QR Codes (relacionado em `event_checkins`)

---