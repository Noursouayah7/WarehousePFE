import { redirect } from 'next/navigation';

export default function ManagerRoutePage() {
  redirect('/manager/orders');
}