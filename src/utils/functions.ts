export function validarNumeroPeruano(numero: string) {
  const regex = /^51\d{9}$/;
  return regex.test(numero);
}
