import axios from "axios";

export async function getListPokemon(url: any, params: any) {
  const result = await axios.get(`https://pokeapi.co/api/v2${url}`, params)
    .then((res) => {
      if (res) {
        return res;
      }
      return {};
    })
    .catch((error) => error);
  return result;
}
