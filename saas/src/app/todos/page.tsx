import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: todos } = await supabase.from('todos').select()

  return (
    <div className="min-h-screen bg-[#030712] text-white p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-[#0b0f19] border border-[#1f2937] p-6 rounded-2xl shadow-xl">
        <h2 className="text-xl font-bold font-outfit mb-4 text-[#a78bfa]">Todo Tasks</h2>
        {todos && todos.length > 0 ? (
          <ul className="space-y-2">
            {todos.map((todo) => (
              <li key={todo.id} className="p-3 bg-[#111827] rounded-lg border border-[#1f2937] text-gray-200">
                {todo.name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400 text-sm">No todo items found in your Supabase table.</p>
        )}
      </div>
    </div>
  )
}
