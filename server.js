const net = require('net')

var players = []
var gameState = 0

net.createServer((socket) => {


    socket.on('data', (data) => {
        var msg = data.toString()
        var player = findPlayer(socket.remoteAddress, socket.remotePort)

        if (gameState == 0) {
            if(msg == 'blackjack' && player == null && players.length == 0){
                players.push({
                    addr: socket.remoteAddress,
                    port: socket.remotePort,
                    name: `Player`,
                    attack: null,
                    client: socket
                })

                players.push({
                    addr: socket.remoteAddress,
                    port: socket.remotePort,
                    name: `Dealer`,
                    attack: null,
                    client: socket
                })

                socket.write('Player have joined a Blackjack Game. \ntype <start> When you are ready.')

                console.log(`Blackjack`)
                return
            }
            if(msg == 'start' && player != null){
                if(player['start'] = 'start'){
                    console.log(`${player.name}(${player.addr}:${player.port}) is Start.`)
                    console.log('Player Ready')
                    gameState = 1

                    announce('Game start')
                }
                return
            }
        }

        if(gameState == 1){
            getResponse(function () {
                player[0].socket.emit('giveCard')
                player[0].socket.emit('giveCard')
                socket.write('If you want more card please type <hit>\nIf you are satisfied with your card please type <stay>')
                gameState = 2
            })
        }

        if(gameState == 2 && msg == 'hit'){
            getResponse(function () {
                player[0].socket.emit('giveCard')
                socket.write('If you want more card please type <hit>\nIf you are satisfied with your card please type <stay>')
            })
        }

        if(gameState == 2 && msg == 'stay'){
            player[1].socket.emit('giveCard')
            player[1].socket.emit('giveCard')
            if(calHands(player[1]) <= 15){
                player[1].socket.emit('giveCard')
            }

            gameState = 3
        }

        if(gameState == 3){
            console.log('Compare points btw Player & Dealer')
            comparePoints(calHands(player[0]), calHands(player[1]))
        }
    })

    socket.on('giveCard', function () {
        var hands = decks()
        for (var i in players) {
            players[i].client.write(JSON.stringify({
                hands: hands[i],
                role: parseInt(i) + 1
            }))
        }
    })

    socket.on('close', function () {
        console.log(`${socket.remoteAddress}:${socket.remotePort} disconnected.`)
    })

    socket.on('error', function (err) {

    })

}).listen(8000, '127.0.0.1')
console.log('Server listening on 127.0.0.1:8000')

function findPlayer(addr, port){
    for (var player of players){
        if (player['addr'] == addr && player['port'] == port) return player
    }
    return null
}

function calHands(hands){
        hands += parseInt.hands[i]
}

function comparePoints(player, dealer) {
    if (player > dealer){
        announce('Player Win!!')
    }
    else if(player < dealer){
        announce('Dealer Win!!')
    }
    else if (player > 21){
        announce('Player busted, Dealer Win!!')
    }
    else if (dealer > 21){
        announce('Dealer busted,Player Win!!')
    }
    else if(player > 21 && dealer > 21){
        announce('All busted, Draw!!')
    }
}

function random(max){
    return Math.floor(Math.random() * max)
}

function decks(){
    var cardDeck = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '10', '10']
    var cardHands = []
    for (var i in players) cardHands.push([])
    while (cardDeck.length > 0){
        for (var i in players) {
            if (cardDeck.length <= 0) break
            var card = cardDeck.splice(random(cardDeck.length), 1)[0]
            cardHands[i].push(card)
        }
    }
    for (var i in players) cardHands[i].push('00')
    return cardHands
}

function announce(msg) {
    for (var player of players) {
        player.client.write(msg)
    }
}