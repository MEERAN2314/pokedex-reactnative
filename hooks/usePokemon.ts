import { pokemonApi } from '@/services/pokemonApi'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'

export const usePokemonList = (limit: number = 20) => {
  return useInfiniteQuery({
    queryKey: ['pokemon-list', limit],
    queryFn: ({ pageParam = 0 }) => pokemonApi.getPokemonList(limit, pageParam),
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.next) {
        const url = new URL(lastPage.next)
        return parseInt(url.searchParams.get('offset') || '0')
      }
      return undefined
    },
    initialPageParam: 0,
  })
}

export const usePokemon = (idOrName: string | number) => {
  return useQuery({
    queryKey: ['pokemon', idOrName],
    queryFn: () => pokemonApi.getPokemon(idOrName),
    enabled: !!idOrName,
  })
}

export const usePokemonSpecies = (idOrName: string | number) => {
  return useQuery({
    queryKey: ['pokemon-species', idOrName],
    queryFn: () => pokemonApi.getPokemonSpecies(idOrName),
    enabled: !!idOrName,
  })
}

export const useSearchPokemon = (query: string) => {
  return useQuery({
    queryKey: ['search-pokemon', query],
    queryFn: () => pokemonApi.searchPokemon(query),
    enabled: query.length > 0,
  })
}

export const useEvolutionChain = (url: string | undefined) => {
  return useQuery({
    queryKey: ['evolution-chain', url],
    queryFn: () => pokemonApi.getEvolutionChain(url!),
    enabled: !!url,
  })
}