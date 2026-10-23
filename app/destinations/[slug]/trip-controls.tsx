'use client'

import { useState } from 'react'
import { ACTIVITIES, STYLES, dateError, localDateISO, weatherIcon, type Trip } from '../../../lib/trip'
import type { TripWeather } from '../../../lib/weather'

export function TripDates({ start, end, onApply }: { start: string; end: string; onApply: (start: string, end: string) => void }) {
  const [departure, setDeparture] = useState(start)
  const [returnDate, setReturnDate] = useState(end)
  const [error, setError] = useState('')
  return <form className="trip-dates-form" onSubmit={e => {
    e.preventDefault()
    const message = dateError(departure, returnDate)
    if (message) { setError(message); return }
    setError(''); onApply(departure, returnDate)
  }}>
    <div><label htmlFor="departure">Departure</label><input id="departure" type="date" required min={localDateISO(new Date())} value={departure} onChange={e => setDeparture(e.target.value)} /></div>
    <div><label htmlFor="return-date">Return</label><input id="return-date" type="date" required min={departure || localDateISO(new Date())} value={returnDate} onChange={e => setReturnDate(e.target.value)} /></div>
    <button className="btn btn--rouge" type="submit">Show what to wear</button>
    {error && <p className="trip-form-error" role="alert">{error}</p>}
  </form>
}

export function TripRefinements({ trip, onChange }: { trip: Trip; onChange: (key: 'activity' | 'style', value: string) => void }) {
  const [showStyle, setShowStyle] = useState(Boolean(trip.activity || trip.style))
  return <section className="trip-refinements" aria-label="Refine your travel edit">
    <p className="kicker">Make it yours (optional)</p>
    <fieldset>
      <legend>What does your trip look like?</legend>
      <div className="trip-choices">{ACTIVITIES.map(a => <button type="button" key={a.value} aria-pressed={trip.activity === a.value} onClick={() => { onChange('activity', trip.activity === a.value ? '' : a.value); setShowStyle(true) }}>{a.label}</button>)}</div>
    </fieldset>
    {!showStyle && !trip.activity && !trip.style && <button type="button" className="trip-skip" onClick={() => setShowStyle(true)}>Skip to personal style</button>}
    {(showStyle || trip.activity || trip.style) && <fieldset>
      <legend>Which direction feels more like you?</legend>
      <div className="trip-choices">{STYLES.map(s => <button type="button" key={s.value} aria-pressed={trip.style === s.value} onClick={() => onChange('style', trip.style === s.value ? '' : s.value)}>{s.label}</button>)}</div>
    </fieldset>}
    <p className="trip-refine-note">Choose what fits. Your looks update here, and you can change your mind anytime.</p>
  </section>
}

export function TripWeatherPanel({ weather }: { weather: TripWeather }) {
  return <section className="trip-weather" aria-label="Weather for your trip">
    <div className="trip-weather-summary">
      <div><p className="kicker">{weather.kind === 'forecast' ? 'Your trip forecast' : weather.kind === 'seasonal' ? 'Seasonal conditions' : 'Weather update'}</p>
        <h2>{weather.low === null ? 'Flexible layers, for now' : `${weather.low}–${weather.high}°C`}</h2>
        <p>{weather.location}</p>
      </div>
      <div><p>{weather.note}</p>
        {weather.rainDays !== null && <p>{weather.rainDays}% of {weather.kind === 'seasonal' ? 'historical sample' : 'forecast'} days have at least 1 mm of precipitation.</p>}
        {weather.kind !== 'unavailable' && <p className="weather-credit">Weather data: <a href="https://www.visualcrossing.com/" target="_blank" rel="noopener noreferrer">Visual Crossing</a>. {weather.kind === 'seasonal' ? 'Historical data averaged by parché.' : 'Daily data summarized by parché.'}</p>}
      </div>
    </div>
    {weather.kind === 'forecast' && <div className="trip-weather-days">{weather.days.map(day => <div key={day.date}>
      <time dateTime={day.date}>{new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(day.date + 'T12:00:00Z'))}</time>
      <span aria-hidden="true">{weatherIcon(day.code)}</span><strong>{Math.round(day.low)}–{Math.round(day.high)}°C</strong><small>{day.rain.toFixed(1)} mm precipitation</small>
    </div>)}</div>}
  </section>
}
