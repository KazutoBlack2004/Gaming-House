'use client';

import React, { useState } from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
} from '@heroui/react';
import { FileText } from 'lucide-react';
import { useAdminStore } from '@/lib/store/useAdminStore';

export default function AdminAuditLogsPage() {
  const { auditLogs } = useAdminStore();
  const [moduleFilter, setModuleFilter] = useState<string>('all');

  const filteredLogs = auditLogs.filter((log) =>
    moduleFilter === 'all' ? true : log.table_name === moduleFilter
  );

  return (
    <div className="space-y-6">
      {/* Encabezado y Filtro por Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-slate-900" />
            Historial de Auditoría y Cambios
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Registro cronológico automático de todas las acciones realizadas en productos, categorías y pedidos.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-xl">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'products', label: 'Productos' },
            { id: 'categories', label: 'Categorías' },
            { id: 'orders', label: 'Pedidos' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setModuleFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${moduleFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla de Historial */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <Table
          aria-label="Tabla de historial de cambios"
          shadow="none"
          classNames={{
            wrapper: 'bg-white p-0 shadow-none',
            th: 'bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider text-[11px] py-4 border-b border-slate-100',
            td: 'py-4 border-b border-slate-50',
          }}
        >
          <TableHeader>
            <TableColumn>FECHA / HORA</TableColumn>
            <TableColumn>ACCIÓN</TableColumn>
            <TableColumn>MÓDULO</TableColumn>
            <TableColumn>DETALLE DEL CAMBIO</TableColumn>
            <TableColumn>RESPONSABLE</TableColumn>
          </TableHeader>
          <TableBody emptyContent="Sin registros en este módulo.">
            {filteredLogs.map((log) => (
              <TableRow key={log.id} className="hover:bg-slate-50/60 transition">
                <TableCell>
                  <span className="font-mono text-xs text-slate-600 font-medium">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </TableCell>
                <TableCell>
                  <Chip
                    color={
                      log.action === 'INSERT'
                        ? 'success'
                        : log.action === 'UPDATE'
                          ? 'primary'
                          : 'danger'
                    }
                    variant="flat"
                    size="sm"
                    className="font-bold text-xs"
                  >
                    {log.action}
                  </Chip>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-xs text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md font-semibold">
                    {log.table_name}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-slate-800 font-medium">
                    {log.summary || `Operación ${log.action} en ${log.table_name}`}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-slate-600 font-semibold">
                    {log.admin_id || 'Sistema'}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
