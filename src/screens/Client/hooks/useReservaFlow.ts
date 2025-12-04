// app/(client)/reservas/hooks/useReservaFlow.ts
import { useState } from 'react';

interface Cancha {
  idCancha: string | null;
}

interface Disciplina {
  idDisciplina: string | null;
}

export default function useReservaFlow() {
  const [fecha, setFecha] = useState<Date | null>(null);
  const [horariosSeleccionados, setHorariosSeleccionados] = useState<string[]>([]);
  const [cliente, setCliente] = useState<any>(null);
  const [cancha, setCancha] = useState<Cancha | null>(null);
  const [disciplina, setDisciplina] = useState<Disciplina | null>(null);
  const [monto, setMonto] = useState<number | null>(null);

  return {
    fecha,
    setFecha,
    horariosSeleccionados,
    setHorariosSeleccionados,
    cliente,
    setCliente,
    cancha,
    setCancha,
    disciplina,
    setDisciplina,
    monto,
    setMonto,
  };
}