import User from '../../database/schemas/user.js';
import Trade from '../../database/schemas/trade.js';

function validateTrade(user1, user1CardsToGive, user2, user2CardsToGive) {
    // controlla che lo scambio non sia vuoto
    if (user1CardsToGive.length === 0 || user2CardsToGive.length === 0) {
        return { isValid: false, error: 'Devi dare e ricevere almeno una carta in uno scambio' };
    };
    // controllo eventuali carte duplicate
    if (user1CardsToGive.length + user2CardsToGive.length !== new Set([...user1CardsToGive.map(card => card.id.toString()), ...user2CardsToGive.map(card => card.id.toString())]).size ) {
        return { isValid: false, error: 'Ci sono carte duplicate nello scambio' };
    }

    // Controlla che user1 abbia tutte le carte che vuole scambiare
    for (var card of user1CardsToGive) {
        var { id, name } = card;
        var cardId = id.toString();
        if (!user1.cards.has(cardId) || user1.cards.get(cardId).copy <= 0) {
            return { isValid: false, error: `Il creatore dello scambio non possiede la carta ${name}` };
        }
    }

    // Controlla che user2 abbia tutte le carte che vuole scambiare
    for (var card of user2CardsToGive) {
        var { id, name } = card;
        var cardId = id.toString();
        if (!user2.cards.has(cardId) || user2.cards.get(cardId).copy <= 0) {
            return { isValid: false, error: `Il ricevitore dello scambio non possiede la carta ${name}` };
        }
    }

    // Controlla che user1 non possieda nessuna delle carte che vuole ricevere
    for (var card of user2CardsToGive) {
        var { id, name } = card;
        var cardId = id.toString();
        if (user1.cards.has(cardId)) {
            return { isValid: false, error: `possiedi già la carta ${name}` };
        }
    }

    // Controlla che user2 non possieda nessuna delle carte che vuole ricevere
    for (var card of user1CardsToGive) {
        var { id, name } = card;
        var cardId = id.toString();
        if (user2.cards.has(cardId)) {
            return { isValid: false, error: `Il tuo amico possiede già la carta ${name}` };
        }
    }

    // Se tutte le condizioni sono soddisfatte, lo scambio è valido
    return { isValid: true, error: null };
}

export const newTrade = async (req, res) => {
    try {
        const { friendMail, myCard, wantedCard } = req.body;
        if (!friendMail || !myCard || !wantedCard) {
            return res.status(400).json({ error: 'Parametri mancanti' });
        }
        if(friendMail == req.user.email) {
            return res.status(400).json({ error: 'Non puoi scambiare carte con te stesso' });
        }
        const friend = await User.findOne({ email: friendMail });
        if (!friend) {
          return res.status(404).json({ error: 'Amico non trovato' });
        }
        const user = await User.findById(req.user.id);
        if (!user) {
          return res.status(404).json({ error: 'Utente non trovato' });
        }

        // controlla che lo scambio sia valido
        var { isValid, error } = validateTrade(user, myCard, friend, wantedCard);
        if (!isValid) {
            return res.status(400).json({ error });
        }

        // crea lo scambio
        const trade = new Trade({
            fromUserId: user.id,
            fromUserEmail: user.email,
            toUserId: friend.id,
            toUserEmail: friend.email,
            fromUserCards: myCard,
            toUserCards: wantedCard,
            status: 'pending',
        });
        await trade.save();
        res.status(200).json("Scambio creato");
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Errore interno' });
    }
}

export const getTrades = async (req, res) => {
    try {
        const filter = {
            $or: [
                { fromUserId: req.user.id },
                { toUserId: req.user.id }
            ]
        };

        const trades = await Trade.find(filter)
        res.status(200).json(trades);
    } catch (error) {
        res.status(500).json({ error: 'Errore interno' });
    }
}

export const acceptTrade = async (req, res) => {
    try {
        const { tradeId } = req.params;
        const trade = await Trade.findById(tradeId);
        if (!trade) {
            return res.status(404).json({ error: 'Scambio non trovato' });
        }
        if (trade.toUserId != req.user.id) {
            return res.status(401).json({ error: 'Non sei autorizzato a modificare questo scambio' });
        }
        if (trade.status != 'pending') {
            return res.status(400).json({ error: 'Scambio già risposto' });
        }

        const user = await User.findById(trade.fromUserId);
        if (!user) {
            return res.status(404).json({ error: 'Utente non trovato' });
        }
        const friend = await User.findById(trade.toUserId);
        if (!friend) {
            return res.status(404).json({ error: 'Utente non trovato' });
        }

        // controlla che lo scambio sia valido
        var { isValid, error } = validateTrade(user, trade.fromUserCards, friend, trade.toUserCards);
        if (!isValid) {
            return res.status(400).json({ error });
        }

        // scambia le carte dei due giocatori
        trade.fromUserCards.forEach(card => {
            var { id } = card;
            var cardId = id.toString();
            var userCard = user.cards.get(cardId);
            if(userCard.copy > 1) {
                userCard.copy -= 1;
                user.cards.set(cardId, userCard);
            } else {
                user.cards.delete(cardId);
            }
            if(friend.cards.has(cardId)) {
                var card = friend.cards.get(cardId);
                card.copy += 1;
                friend.cards.set(cardId, card);
            } else {
                friend.cards.set(cardId, { name: userCard.name, image: userCard.image, copy: 1 } );
            }
        });
        trade.toUserCards.forEach(card => {
            var { id } = card;
            var cardId = id.toString();
            var friendCard = friend.cards.get(cardId);
            if(friendCard.copy > 1) {
                friendCard.copy -= 1;
                friend.cards.set(cardId, friendCard);
            } else {
                friend.cards.delete(cardId);
            }
            if(user.cards.has(cardId)) {
                var card = user.cards.get(cardId);
                card.copy += 1;
                user.cards.set(cardId, card);
            } else {
                user.cards.set(cardId, { name: friendCard.name, image: friendCard.image, copy: 1 } );
            }
        });

        await user.save();
        await friend.save();

        trade.status = 'accepted';
        await trade.save();
        res.status(200).json("Scambio accettato");
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Errore interno' });
    }
}

export const rejectTrade = async (req, res) => {
    try {
        const { tradeId } = req.params;
        const trade = await Trade.findById(tradeId);
        if (!trade) {
            return res.status(404).json({ error: 'Scambio non trovato' });
        }
        if (trade.toUserId != req.user.id) {
            return res.status(401).json({ error: 'Non sei autorizzato a modificare questo scambio' });
        }
        if (trade.status != 'pending') {
            return res.status(400).json({ error: 'Scambio già risposto' });
        }

        trade.status = 'rejected';
        await trade.save();
        res.status(200).json("Scambio rifiutato");
    } catch (error) {
        res.status(500).json({ error: 'Errore interno' });
    }
}

export const cancelTrade = async (req, res) => {
    try {
        const { tradeId } = req.params;
        const trade = await Trade.findById(tradeId);
        if (!trade) {
            return res.status(404).json({ error: 'Scambio non trovato' });
        }
        if (trade.fromUserId != req.user.id) {
            return res.status(401).json({ error: 'Non sei autorizzato a modificare questo scambio' });
        }
        if (trade.status != 'pending') {
            return res.status(400).json({ error: 'Scambio già risposto' });
        }

        await Trade.deleteOne({ _id: tradeId });
        res.status(200).json("Scambio cancellato");
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Errore interno' });
    }
}