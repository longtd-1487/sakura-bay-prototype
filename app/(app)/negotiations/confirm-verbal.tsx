"use client";
import { useState } from "react";
import { ApiButton } from "@/components/actions";
export default function ConfirmVerbal({ id }: { id: string }) {
  const [name, setName] = useState("");
  return <div className="flex gap-2 items-start"><input className="input w-36" placeholder="Tên người xác nhận" value={name} onChange={(e) => setName(e.target.value)} /><ApiButton url={`/api/negotiations/${id}`} body={{ confirmed_by_name: name }} className="btn-ghost">Ghi xác nhận miệng</ApiButton><ApiButton url={`/api/negotiations/${id}`} method="DELETE" className="btn-ghost text-coral-600">Hủy</ApiButton></div>;
}
