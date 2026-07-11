import { Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'

type AssignedAsset = {
  id: string
  modelo: string
  tipo: string
  numeroSerie?: string | null
  status: string
}

type AssignedAssetsDialogProps = {
  open: boolean
  title: string
  loading: boolean
  assets: AssignedAsset[]
  emptyMessage: string
  deallocatingAssetId: string | null
  onClose: () => void
  onDeallocate: (assetId: string) => void
}

export default function AssignedAssetsDialog({
  open,
  title,
  loading,
  assets,
  emptyMessage,
  deallocatingAssetId,
  onClose,
  onDeallocate,
}: AssignedAssetsDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {loading ? (
          <div className="py-8 text-center text-gray-500">Carregando ativos...</div>
        ) : assets.length === 0 ? (
          <div className="py-8 text-center text-gray-500">{emptyMessage}</div>
        ) : (
          <div className="space-y-3 py-2">
            {assets.map((asset) => (
              <div key={asset.id} className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-semibold text-gray-900">{asset.modelo}</div>
                  <div className="mt-1 text-sm text-gray-600">Tipo: {asset.tipo}</div>
                  <div className="mt-1 text-sm text-gray-600">S/N: {asset.numeroSerie ?? '—'}</div>
                  <div className="mt-1 text-sm text-gray-600">Status: {asset.status}</div>
                </div>
                <button
                  type="button"
                  onClick={() => onDeallocate(asset.id)}
                  disabled={Boolean(deallocatingAssetId)}
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-4 text-sm font-medium text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50 transition"
                >
                  {deallocatingAssetId === asset.id ? 'Desalocando...' : 'Desalocar'}
                </button>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
      <DialogActions className="gap-3 p-4">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          Fechar
        </button>
      </DialogActions>
    </Dialog>
  )
}
