-- Trigger automatycznego tworzenia profilu użytkownika
-- Wykonaj ten skrypt w Supabase SQL Editor

-- Funkcja trigger - tworzy profil użytkownika po rejestracji
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, ai_generation_count, ai_generation_date)
  VALUES (
    NEW.id,
    0,
    NULL
  );
  RETURN NEW;
END;
$$;

-- Trigger na tabeli auth.users - wykonuje się po INSERT (rejestracji)
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Weryfikacja: po wykonaniu tego skryptu, każda nowa rejestracja automatycznie utworzy rekord w tabeli profiles
