"use client";

import { useActionState } from "react";

import { registerUser, type RegisterState } from "@/lib/actions/auth";

const initialState: RegisterState = {};

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(
    registerUser,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium text-foreground">
          Tu nombre
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder="Puede ser un apodo, no hace falta que sea tu nombre legal"
          className="rounded-md border border-input px-3 py-2 text-sm outline-none focus:border-foreground"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded-md border border-input px-3 py-2 text-sm outline-none focus:border-foreground"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label
          htmlFor="password"
          className="text-sm font-medium text-foreground"
        >
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          className="rounded-md border border-input px-3 py-2 text-sm outline-none focus:border-foreground"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="code" className="text-sm font-medium text-foreground">
          Código de acceso
        </label>
        <input
          id="code"
          name="code"
          type="text"
          required
          placeholder="Te lo ha dado el admin de tu iglesia"
          className="rounded-md border border-input px-3 py-2 text-sm outline-none focus:border-foreground"
        />
      </div>
      {state.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Creando cuenta…" : "Crear cuenta"}
      </button>
    </form>
  );
}
