export interface PaymentMethodInterface {
  [x: string]: Key | null | undefined;
  id: number;
  name: string;
}