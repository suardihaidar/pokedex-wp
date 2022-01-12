import React, { useState, useEffect } from "react";
import constructImageUrl from "../../helpers/constructImageUrl";
import Loading from "../Loading/Loading";
import { getListPokemon } from "../../services/api.service";

export default function Dashboard() {
  const [keyword, setKeyword] = useState("");
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [isFilteredList, setIsFilteredList] = useState(false);

  const [pokemonList, setPokemonList] = useState<any>([]);
  const [pokemonDetail, setPokemonDetail] = useState<any>({});
  const [pokemonListOriginal, setPokemonListOriginal] = useState<any>([]);

  const [offsetParam, setOffsetParam] = useState(0);
  const [pokemonType, setPokemonType] = useState<any>([]);
  const [dataNotFound, setDataNotFound] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [loadingOverlay, setLoadingOverlay] = useState(false);

  const [type, setType] = useState("all");

  useEffect(() => {
    getData({ offset: offsetParam, limit: 16 }, "pokemon");
    getData({}, "type", undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!keyword) {
      setPokemonList(() => pokemonListOriginal);
      setDataNotFound(false);
      setIsFilteredList(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword]);

  const constructDataList = (data?: any, isByType?: any) =>
    data.map((val: any) => ({
      name: isByType ? val.pokemon.name : val.name,
      url: isByType ? val.pokemon.url : val.url,
      img: constructImageUrl(isByType ? val.pokemon.url : val.url),
    }));

  async function getData(
    params = {},
    endpointParam = "",
    pokemonName = "",
    isSearch = false
  ) {
    try {
      const { data } = await getListPokemon(
        `/${endpointParam}/${pokemonName}`,
        params
      );

      if (endpointParam === "pokemon" && pokemonName && isSearch) {
        const url = `https://pokeapi.co/api/v2/pokemon/${data.id}/`;

        setPokemonList((): any => [
          {
            name: data.name,
            url,
            img: constructImageUrl(url),
          },
        ]);
      } else if (endpointParam === "pokemon" && pokemonName) {
        setPokemonDetail(data);
      } else if (endpointParam === "pokemon") {
        setPokemonList([...pokemonList, ...constructDataList(data.results)]);
        setPokemonListOriginal([
          ...pokemonList,
          ...constructDataList(data.results),
        ]);
        setOffsetParam((val) => {
          const offsetValue = val;
          const newOffsetValue = offsetValue + 16;
          return newOffsetValue;
        });
      } else if (endpointParam === "type") {
        if (!pokemonName) {
          setPokemonType(data.results);
        } else {
          setPokemonList(constructDataList(data.pokemon, true));
        }
      }
    } catch (error) {
      if (isSearch && keyword) {
        setDataNotFound(true);
        setPokemonList(() => []);
      }
    } finally {
      setLoadingSearch(false);

      setTimeout(() => setLoadingDetail(false), 350);
      setTimeout(() => setLoadingOverlay(false), 500);
    }
  }

  const searchPokemonByKeyword = (e: any) => {
    e.preventDefault();

    if (keyword) {
      setLoadingSearch(true);
      setIsFilteredList(true);
      getData({}, "pokemon", keyword.trim().toLocaleLowerCase(), true);
    }
  };

  const getIndex = (number: number) => {
    const id = number + 1;
    const idLength = id.toString().length;
    if (idLength === 1) {
      return "#00" + id;
    } else if (idLength === 2) {
      return "#0" + id;
    }
    return "#" + id;
  };

  const getDetailPokemon = (endpointParam: any, pokemonName: any) => {
    setLoadingDetail(true);
    getData({}, endpointParam, pokemonName);
  };

  const graphClassName = (width: any) => {
    let className = "h-3 rounded bg";
    const barColor = 20;
    if (width <= barColor) {
      className += "-low-hp";
    } else if (width > barColor && width <= barColor * 2) {
      className += "-medium-hp";
    } else if (width > barColor * 2 && width <= barColor * 3) {
      className += "-high-hp";
    } else if (width > barColor * 3 && width <= barColor * 4) {
      className += "-epic-hp";
    }
    return className;
  };

  const loadMore = () => {
    getData({ offset: offsetParam, limit: 16 }, "pokemon");
  };

  const filteredPokemonListBy = (value: string, type: any) => {
    setIsFilteredList(true);

    if (value) {
      setLoadingOverlay(true);
      getData({}, type, value);
    } else {
      setLoadingOverlay(true);
      setPokemonList(() => []);
      setPokemonList(() => pokemonListOriginal);
      setIsFilteredList(false);

      setTimeout(() => setLoadingOverlay(false), 500);
    }
  };

  return (
    <div className="flex flex-1 h-screen">
      {/* left panel */}
      <div className="p-2 w-1/12 shadow-lg overflow-y-auto">
        <button
          onClick={() => {
            setType("all");
            filteredPokemonListBy("", "type");
          }}
          className={`${
            type === "all" ? "bg-gray-400 text-white" : "bg-gray-100"
          } hover:bg-gray-300 w-full h-10 rounded mb-3 flex justify-center items-center`}
        >
          <span className="text-sm font-medium">ALL</span>
        </button>
        {pokemonType?.map((val: any) => (
          <button
            onClick={() => {
              setType(val.name);
              filteredPokemonListBy(val.name, "type");
            }}
            className={`${
              type === val.name
                ? `bg-${val.name}-type text-white`
                : `bg-gray-100 text-${val.name}-type`
            } hover:bg-gray-300 w-full h-10 rounded mb-3 flex justify-center items-center`}
          >
            <span className="text-sm font-medium uppercase">{val.name}</span>
          </button>
        ))}
      </div>
      {/* content */}
      <div className="flex flex-col flex-1 h-full bg-gray-100 p-2">
        {/* search bar */}
        <div className="flex-row flex self-center">
          <form onSubmit={(e) => searchPokemonByKeyword(e)}>
            <div className="flex border-2 rounded">
              <input
                onChange={(e) => setKeyword(e.target.value)}
                className="px-4 py-2 w-full"
                type="text"
                placeholder="Search Pokemon Name"
                disabled={!!loadingSearch}
              />
              <button
                type="submit"
                className="flex items-center justify-center px-4 border-l"
              >
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <path d="M16.32 14.9l5.39 5.4a1 1 0 0 1-1.42 1.4l-5.38-5.38a8 8 0 1 1 1.41-1.41zM10 16a6 6 0 1 0 0-12 6 6 0 0 0 0 12z" />
                </svg>
              </button>
            </div>
          </form>
        </div>
        {/* card */}
        {loadingOverlay || loadingSearch ? (
          <Loading />
        ) : dataNotFound ? (
          <div className="flex flex-1 justify-center mt-10">
            <h5>Pokemon {keyword} not found!</h5>
          </div>
        ) : (
          <div className="flex flex-col flex-1 overflow-y-auto m-2">
            <div className="flex justify-center flex-wrap w-full">
              {pokemonList?.map((val: any, index: any) => (
                <div
                  onClick={() => getDetailPokemon("pokemon", val.name)}
                  className="bg-white hover:bg-blue-100 shadow-lg m-2 w-56 h-56 cursor-pointer rounded-lg flex items-center flex-col p-2 justify-center"
                >
                  {val.img ? (
                    <img src={val.img} alt={val.name} />
                  ) : (
                    <div className="bg-gray-700 rounded-full w-20 h-20"></div>
                  )}

                  <div className="font-bold text-gray-400 my-3">
                    {getIndex(index)}
                  </div>

                  <div className="font-bold text-xl capitalize">{val.name}</div>
                </div>
              ))}
            </div>

            {pokemonList && !isFilteredList && (
              <button
                type="button"
                onClick={() => loadMore()}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 my-5 rounded w-1/3 self-center"
              >
                Load More
              </button>
            )}
          </div>
        )}
      </div>
      {/* right panel */}
      {loadingDetail ? (
        <div className="w-1/3 p-2 bg-gray-100 flex h-full">
          <Loading />
        </div>
      ) : (
        pokemonDetail.id && (
          <div className="w-1/3 p-2 bg-gray-100">
            <div className="bg-white rounded-lg flex-1 h-full p-2 flex flex-col items-center shadow-lg">
              <button
                onClick={() => setPokemonDetail({})}
                type="button"
                className="bg-white rounded-full p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none self-start"
              >
                <span className="sr-only">Close menu</span>
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <div>
                {pokemonDetail?.sprites?.other ? (
                  <img
                    src={
                      pokemonDetail?.sprites?.other.dream_world.front_default
                    }
                    alt={pokemonDetail?.name}
                    className="w-32 h-32"
                  />
                ) : (
                  <div className="bg-gray-700 rounded-full w-44 h-44"></div>
                )}
              </div>

              <div className="font-bold text-gray-400 text-lg">
                {getIndex(pokemonDetail?.id - 1)}
              </div>

              <div className="font-bold text-2xl capitalize">
                {pokemonDetail?.name}
              </div>

              <div className="flex justify-center flex-wrap w-full">
                {pokemonDetail?.types?.map((val: any) => (
                  <div
                    className={`bg-${val?.type?.name}-type rounded-lg p-3 h-10 flex justify-center items-center m-1 uppercase font-semibold`}
                  >
                    {val.type?.name}
                  </div>
                ))}
              </div>

              <strong className="mt-2">ABILITIES</strong>
              <div className="flex justify-center flex-wrap w-full">
                {pokemonDetail?.abilities?.map((val: any) => (
                  <div className="bg-gray-100 rounded-lg p-3 h-10 flex justify-center items-center m-1 capitalize font-medium">
                    {val.ability?.name}
                  </div>
                ))}
              </div>
              {/* height, weight, base exp */}
              <div className="flex w-full justify-center flex-row my-2">
                <div className="flex flex-col justify-center items-center">
                  <strong>HEIGHT</strong>
                  <div className="bg-gray-100 rounded-lg p-3 h-10 flex justify-center items-center m-1 w-28">
                    {pokemonDetail?.height / 10} m
                  </div>
                </div>
                <div className="flex flex-col justify-center items-center">
                  <strong>WEIGHT</strong>
                  <div className="bg-gray-100 rounded-lg p-3 h-10 flex justify-center items-center m-1 w-28">
                    {pokemonDetail?.weight / 10} kg
                  </div>
                </div>
                <div className="flex flex-col justify-center items-center">
                  <strong>BASE EXP</strong>
                  <div className="bg-gray-100 rounded-lg p-3 h-10 flex justify-center items-center m-1 w-28">
                    {pokemonDetail?.base_experience}
                  </div>
                </div>
              </div>
              {/* stats */}
              <div className="flex flex-col justify-center items-center">
                <strong>STATS</strong>
                <table className="text-xs">
                  <tbody>
                    {pokemonDetail?.stats?.map((val: any) => (
                      <tr>
                        <td className="text-right text-gray-400 p-1">
                          <strong>{val.stat?.name}</strong>
                        </td>
                        <td className="w-14 text-center">{val.base_stat}</td>
                        <td>
                          <div className="w-52 bg-gray-100 h-3 rounded overflow-hidden">
                            <div
                              className={`${graphClassName(
                                (val.base_stat / 255) * 100
                              )}`}
                              style={{
                                width: (val.base_stat / 255) * 100 + "%",
                              }}
                            ></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
