const R = require('ramda')
const moment = require('moment')
const axios = require('axios')
const table = require('./table')

const fixFecha = (fecha) => {
  const torneos = R.map(fixTorneo, fecha.torneos)
  return R.merge(fecha, { torneos })
}

const fixTorneo = (torneo) => {
  const emojis = {
    Fútbol: '⚽',
    Básquet: '🏀',
    Boxeo: '🥊',
    Polideportivo: '🏅',
    Rugby: '🏉',
    Golf: '⛳',
    Voley: '🏐',
    MMA: '🤼',
    Automovilismo: '🏎️',
    Tenis: '🎾'
  }
  const nombre = torneo.nombre.replace('\t', '')
  const eventos = R.map(fixEvento, torneo.eventos)
  const deporte = torneo.deporte.nombre
  const emoji = emojis[deporte]
  return R.merge(torneo, { nombre, eventos, deporte, emoji })
}

const fixEvento = (evento) => {
  const nombre = evento.nombre.replace('\t', '')
  const equipos = nombre.includes(' - ') ? nombre.split(' - ') : []
  const deporte = evento.deporte.nombre
  const canales = R.map((e) => e.nombre, evento.canales)
  const fecha = moment(evento.fecha)
  return R.merge(evento, { nombre, equipos, deporte, canales, fecha })
}

module.exports = function (vorpal) {
  vorpal
    .command('ole', 'Lista eventos de la agenda deportiva Olé')
    .action(async (args, cb) => {
      try {
        const url =
          'https://www.ole.com.ar/wg-agenda-deportiva/json/agenda.json'
        const response = await axios.get(url)
        const agenda = R.pipe(
          R.prop(['fechas']),
          R.project(['fecha', 'torneos']),
          R.map(fixFecha),
          table
        )(response.data)
        this.log(agenda.toString())
      } catch (error) {
        console.error(error)
      }
    })
}
