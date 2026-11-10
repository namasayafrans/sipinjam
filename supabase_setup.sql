-- Jalankan di Supabase > SQL Editor. Backup dahulu jika database berisi data penting.
-- Mengasumsikan tabel/kolom sesuai project saat ini: profiles(id,full_name,role),
-- categories, items, loans, loan_items.

CREATE OR REPLACE FUNCTION public.is_sipinjam_admin()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() AND lower(trim(role)) = 'admin'
  );
END;
$$;
GRANT EXECUTE ON FUNCTION public.is_sipinjam_admin() TO authenticated;

CREATE OR REPLACE FUNCTION public.handle_new_sipinjam_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles(id,full_name,role)
  VALUES(new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)), 'member')
  ON CONFLICT(id) DO NOTHING;
  RETURN new;
END;
$$;
DROP TRIGGER IF EXISTS on_auth_user_created_sipinjam ON auth.users;
CREATE TRIGGER on_auth_user_created_sipinj AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_sipinjam_user();

INSERT INTO public.profiles(id,full_name,role)
SELECT u.id, coalesce(u.raw_user_meta_data->>'full_name', split_part(u.email,'@',1)), 'member'
FROM auth.users u ON CONFLICT(id) DO NOTHING;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_select_self_admin ON public.profiles;
DROP POLICY IF EXISTS categories_read_auth ON public.categories;
DROP POLICY IF EXISTS categories_admin_all ON public.categories;
DROP POLICY IF EXISTS items_read_auth ON public.items;
DROP POLICY IF EXISTS items_admin_all ON public.items;
DROP POLICY IF EXISTS loans_read_owner_admin ON public.loans;
DROP POLICY IF EXISTS loans_member_insert ON public.loans;
DROP POLICY IF EXISTS loans_admin_update ON public.loans;
DROP POLICY IF EXISTS loan_items_read_owner_admin ON public.loan_items;
DROP POLICY IF EXISTS loan_items_member_insert ON public.loan_items;
DROP POLICY IF EXISTS loan_items_admin_all ON public.loan_items;

CREATE POLICY profiles_select_self_admin ON public.profiles FOR SELECT TO authenticated
USING(id = auth.uid() OR public.is_sipinjam_admin());

CREATE POLICY categories_read_auth ON public.categories FOR SELECT TO authenticated USING(true);
CREATE POLICY categories_admin_all ON public.categories FOR ALL TO authenticated
USING(public.is_sipinjam_admin()) WITH CHECK(public.is_sipinjam_admin());
CREATE POLICY items_read_auth ON public.items FOR SELECT TO authenticated USING(true);
CREATE POLICY items_admin_all ON public.items FOR ALL TO authenticated
USING(public.is_sipinjam_admin()) WITH CHECK(public.is_sipinjam_admin());

CREATE POLICY loans_read_owner_admin ON public.loans FOR SELECT TO authenticated
USING(user_id = auth.uid() OR public.is_sipinjam_admin());
CREATE POLICY loans_member_insert ON public.loans FOR INSERT TO authenticated
WITH CHECK(user_id = auth.uid() AND lower(coalesce(status,'pending')) = 'pending');
CREATE POLICY loans_admin_update ON public.loans FOR UPDATE TO authenticated
USING(public.is_sipinjam_admin()) WITH CHECK(public.is_sipinjam_admin());

CREATE POLICY loan_items_read_owner_admin ON public.loan_items FOR SELECT TO authenticated
USING(public.is_sipinjam_admin() OR EXISTS(SELECT 1 FROM public.loans l WHERE l.id = loan_items.loan_id AND l.user_id = auth.uid()));
CREATE POLICY loan_items_member_insert ON public.loan_items FOR INSERT TO authenticated
WITH CHECK(EXISTS(SELECT 1 FROM public.loans l WHERE l.id = loan_items.loan_id AND l.user_id = auth.uid() AND lower(coalesce(l.status,'pending')) = 'pending'));
CREATE POLICY loan_items_admin_all ON public.loan_items FOR ALL TO authenticated
USING(public.is_sipinjam_admin()) WITH CHECK(public.is_sipinjam_admin());

UPDATE public.profiles p 
SET role = 'admin' 
FROM auth.users u
WHERE p.id = u.id AND u.email = 'admin@gmail.com';
