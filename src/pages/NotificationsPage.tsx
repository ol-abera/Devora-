import { Link } from "react-router-dom"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Bell, CheckCheck, Trash2 } from "lucide-react"
import { meApi } from "@/api"
import { useAuth } from "@/context/AuthContext"
import { keys, useNotifications } from "@/hooks/queries"
import { EmptyState, ErrorState, PageShell, Spinner } from "@/components/ui"
import { useI18n } from "@/i18n"
import { formatDate } from "@/lib/money"
import { toast } from "sonner"

export default function NotificationsPage() {
  const { t } = useI18n()
  const { user } = useAuth()
  const qc = useQueryClient()
  const { data, isLoading, isError, error, refetch } = useNotifications()
  const refresh = () => qc.invalidateQueries({ queryKey: [...keys.notifications, user?.id] })
  const readOne = useMutation({ mutationFn: meApi.markNotificationRead, onSuccess: refresh })
  const readAll = useMutation({ mutationFn: meApi.markAllNotificationsRead, onSuccess: refresh })
  const deleteOne = useMutation({
    mutationFn: meApi.deleteNotification,
    onSuccess: () => { refresh(); toast.success("Notification deleted") },
    onError: (e: Error) => toast.error(e.message),
  })
  const deleteAll = useMutation({
    mutationFn: meApi.deleteAllNotifications,
    onSuccess: () => { refresh(); toast.success("All notifications cleared") },
    onError: (e: Error) => toast.error(e.message),
  })
  const unread = (data ?? []).filter(n => !n.read).length

  return (
    <PageShell narrow>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Bell className="text-[#7C3AED]" /> {t("notifications.title")}</h1>
        <div className="flex items-center gap-3">
          {unread > 0 && (
            <button type="button" onClick={() => readAll.mutate()} className="inline-flex items-center gap-1.5 text-sm font-medium text-[#7C3AED]">
              <CheckCheck size={16} /> {t("notifications.markAll")}
            </button>
          )}
          {(data?.length ?? 0) > 0 && (
            <button
              type="button"
              onClick={() => deleteAll.mutate()}
              disabled={deleteAll.isPending}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700"
            >
              <Trash2 size={16} /> Clear all
            </button>
          )}
        </div>
      </div>
      {isLoading ? <Spinner label={t("notifications.loading")} /> : isError ? <ErrorState message={error.message} onRetry={() => refetch()} /> : !data?.length ? (
        <div className="mt-6 bg-white rounded-2xl border border-slate-100"><EmptyState icon={<Bell size={40} />} title={t("notifications.empty")} hint={t("notifications.emptyHint")} /></div>
      ) : (
        <ul className="mt-6 space-y-2">
          {data.map(n => {
            const body = (
              <>
                <div className="flex items-start justify-between gap-3">
                  <p className={`text-sm ${n.read ? "text-slate-700" : "font-semibold text-slate-900"}`}>{n.title}</p>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-[#7C3AED] mt-1.5 shrink-0" aria-label={t("notifications.unread")} />}
                </div>
                <p className="text-sm text-slate-500 mt-0.5">{n.body}</p>
                <p className="text-[11px] text-slate-400 mt-1">{formatDate(n.createdAt)}</p>
              </>
            )
            const cls = "flex-1 block text-left min-w-0"
            return (
              <li key={n.id} className="flex items-stretch gap-1 bg-white rounded-xl border border-slate-100 p-3 hover:border-[#7C3AED]/30">
                {n.link ? (
                  <Link to={n.link} onClick={() => !n.read && readOne.mutate(n.id)} className={cls}>{body}</Link>
                ) : (
                  <button type="button" onClick={() => !n.read && readOne.mutate(n.id)} className={cls}>{body}</button>
                )}
                <button
                  type="button"
                  onClick={() => deleteOne.mutate(n.id)}
                  disabled={deleteOne.isPending}
                  className="shrink-0 self-center p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  aria-label="Delete notification"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </PageShell>
  )
}
