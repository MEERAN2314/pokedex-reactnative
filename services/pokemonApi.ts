import { Pokemon, PokemonListResponse } from '@/types/pokemon'
import axios from 'axios'

const BASE_URL = 'https://pokeapi.co/api/v2'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
})

export const pokemonApi = {
  // Get list of Pokemon with pagination
  getPokemonList: async (limit: number = 20, offset: number = 0): Promise<PokemonListResponse> => {
    const response = await api.get(`/pokemon?limit=${limit}&offset=${offset}`)
    return response.data
  },

  // Get detailed Pokemon data
  getPokemon: async (idOrName: string | number): Promise<Pokemon> => {
    const response = await api.get(`/pokemon/${idOrName}`)
    return response.data
  },

  // Search Pokemon by name
  searchPokemon: async (query: string): Promise<Pokemon[]> => {
    try {
      // Try to get exact match first
      const response = await api.get(`/pokemon/${query.toLowerCase()}`)
      return [response.data]
    } catch (error) {
      // If exact match fails, return empty array
      // In a real app, you might want to implement fuzzy search
      return []
    }
  },

  // Get Pokemon species data (for descriptions, evolution chain, etc.)
  getPokemonSpecies: async (idOrName: string | number) => {
    const response = await api.get(`/pokemon-species/${idOrName}`)
    return response.data
  },

  // Get evolution chain
  getEvolutionChain: async (url: string) => {
    const response = await axios.get(url)
    return response.data
  },

  // Get type data
  getType: async (name: string) => {
    const response = await api.get(`/type/${name}`)
    return response.data
  },
}

export default pokemonApi