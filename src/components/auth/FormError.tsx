interface FormErrorProps {
  message: string;
  id?: string;
}

export function FormError({ message, id }: FormErrorProps) {
  return (
    <p id={id} className="text-sm text-destructive">
      {message}
    </p>
  );
}
