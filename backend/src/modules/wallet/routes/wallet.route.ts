import { Router } from 'express'
import { container } from 'tsyringe'

import { requireAuth } from '../../../core/middleware/requireAuth'
import { WalletController } from '../controller/wallet.controller'

export const createWalletRoutes = () => {
    const router = Router()
    const walletController = container.resolve(WalletController)

    router.use(requireAuth)

    router.post('/credit', walletController.credit)
    router.post('/debit', walletController.debit)
    router.get('/', walletController.getWallet)

    return router
}