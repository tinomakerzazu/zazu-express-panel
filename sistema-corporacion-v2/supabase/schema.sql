create extension if not exists "pgcrypto";

create table if not exists comprobantes_lima (
    id uuid primary key default gen_random_uuid(),
    numero text,
    celular text,
    monto numeric,
    fecha date,
    hora time,
    metodo text,
    destinatario text,
    destino text,
    operacion text,
    seguridad text,
    concepto text,
    image_data text,
    created_at timestamptz default now()
);

create table if not exists comprobantes_provincia (
    id uuid primary key default gen_random_uuid(),
    numero text,
    celular text,
    monto numeric,
    fecha date,
    hora time,
    metodo text,
    destinatario text,
    destino text,
    operacion text,
    seguridad text,
    concepto text,
    image_data text,
    created_at timestamptz default now()
);

create table if not exists comprobantes_caja (
    id uuid primary key default gen_random_uuid(),
    caja text,
    tipo text,
    monto numeric,
    fecha date,
    hora time,
    concepto text,
    image_data text,
    created_at timestamptz default now()
);

alter table comprobantes_lima enable row level security;
alter table comprobantes_provincia enable row level security;
alter table comprobantes_caja enable row level security;

create policy "public read comprobantes lima"
    on comprobantes_lima for select
    using (true);

create policy "public insert comprobantes lima"
    on comprobantes_lima for insert
    with check (true);

create policy "public delete comprobantes lima"
    on comprobantes_lima for delete
    using (true);

create policy "public read comprobantes provincia"
    on comprobantes_provincia for select
    using (true);

create policy "public insert comprobantes provincia"
    on comprobantes_provincia for insert
    with check (true);

create policy "public delete comprobantes provincia"
    on comprobantes_provincia for delete
    using (true);

create policy "public read comprobantes caja"
    on comprobantes_caja for select
    using (true);

create policy "public insert comprobantes caja"
    on comprobantes_caja for insert
    with check (true);

create policy "public delete comprobantes caja"
    on comprobantes_caja for delete
    using (true);
