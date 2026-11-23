-- Liga cada entrega (submissions) a la CUENTA del estudiante que la envió.
-- Antes solo se guardaba el nombre/email tecleado; ahora se guarda user_id (users.id).
alter table submissions add column if not exists user_id uuid;
create index if not exists idx_submissions_user_id on submissions(user_id);

-- Reconecta entregas antiguas a su cuenta cuando el email coincide.
update submissions s set user_id = u.id
from users u
where s.user_id is null and s.student_email is not null
  and lower(s.student_email) = lower(u.email);
