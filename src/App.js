import React, { Fragment, useState, useEffect, useRef, useMemo } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { Dialog, Transition } from '@headlessui/react';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Bars3Icon, MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import data from './data.json';
import rarityData from './rarity.json';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function App() {
  const [items, setItems] = useState([]);
  const itemsPerPage = 20;
  const searchInputRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [openCategory, setOpenCategory] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTraits, setSelectedTraits] = useState([]);
  const [searchedItems, setSearchedItems] = useState([]);

  const handleFilterChange = (category, trait) => {
    const categoryTrait = { category, trait };

    setSelectedCategories((prevCategories) => {
      const categoryIndex = prevCategories.findIndex(
        (item) =>
          item.category === categoryTrait.category && item.trait === categoryTrait.trait
      );

      if (categoryIndex > -1) {
        const updatedCategories = [...prevCategories];
        updatedCategories.splice(categoryIndex, 1);
        return updatedCategories;
      }

      return [...prevCategories, categoryTrait];
    });

    setSelectedTraits((prevTraits) => {
      const traitIndex = prevTraits.findIndex(
        (item) =>
          item.category === categoryTrait.category && item.trait === categoryTrait.trait
      );

      if (traitIndex > -1) {
        // If the categoryTrait already exists in the selected traits, remove it
        const updatedTraits = [...prevTraits];
        updatedTraits.splice(traitIndex, 1);
        return updatedTraits;
      }

      // Add the categoryTrait to the selected traits
      return [...prevTraits, categoryTrait];
    });
  };

  //linked to search bar
  //change VULA to your collection name
  const handleSearch = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    console.log(`Search Query: VULA #${query}`);

    // Update searchedItems based on the new search query
    const searched = data.filter((item) => {
      const pattern = new RegExp(`VULA #${query}`);
      return pattern.test(item.name);
    });

    console.log(searched);
    setSearchedItems(searched);
  };

  //categories and traits on the side bar
  const filteredItems = useMemo(() => {
    if (selectedCategories.length === 0 && selectedTraits.length === 0 && searchQuery === '') {
      return data; // If no filters or search query are applied, include all items
    }

    return data.filter((item) => {
      if (selectedCategories.length > 0) {
        const matchingCategories = selectedCategories.filter((category) =>
          item.attributes.some(
            (attribute) =>
              attribute.trait_category === category.category &&
              attribute.trait_info.trait === category.trait
          )
        );
        if (matchingCategories.length !== selectedCategories.length) {
          return false; // Exclude items that don't have all selected categories and traits
        }
      }

      return (
        selectedTraits.some((selectedTrait) => {
          return item.attributes.some(
            (attribute) =>
              selectedTrait.category === attribute.trait_category &&
              selectedTrait.trait === attribute.trait_info.trait
          );
        }) ||
        (searchQuery !== '' && item.name === `VULA #${searchQuery}`)
      );
    });
  }, [selectedCategories, selectedTraits, searchQuery]);

  //displayed all, filtered, or searched items
  const [nextItems, setNextItems] = useState([]);

  useEffect(() => {
    if (searchQuery === '') {
      setItems(filteredItems.slice(0, itemsPerPage));
    } else if (searchedItems.length > 0) {
      setItems(searchedItems.slice(0, itemsPerPage));
    } else {
      setItems([]);
    }
  }, [filteredItems, searchedItems, itemsPerPage, searchQuery]);

  const fetchMoreData = () => {
  setTimeout(() => {
    const startIndex = items.length;
    const endIndex = startIndex + itemsPerPage;
    const nextItemsBatch = filteredItems.slice(startIndex, endIndex);

    const uniqueNextItems = nextItemsBatch.filter((nextItem) => {
      return !items.some((item) => item.id === nextItem.id);
    });

    if (uniqueNextItems.length > 0) {
      setItems((prevItems) => {
        const allItems = [...prevItems, ...uniqueNextItems];
        return allItems.slice(0, Math.min(allItems.length, startIndex + itemsPerPage));
      });
    }
  }, 300);
};

useEffect(() => {
  if (nextItems.length > 0) {
    setItems((prevItems) => {
      const allItems = [...prevItems, ...nextItems];
      return allItems.slice(0, itemsPerPage);
    });
    setNextItems([]);
  }
}, [nextItems]);



  // Log selected traits
  /* useEffect(() => {
    console.log('Selected Traits:', selectedTraits);
  }, [selectedTraits]); */

  const handleCategoryClick = (category) => {
    setOpenCategory((prevCategory) => (prevCategory === category ? '' : category));
  };

  const openModal = (item) => {
    setSelectedItem(item);
    setIsOpen(true);
    document.body.classList.add('modal-open');
  };

  const closeModal = () => {
    setSelectedItem(null);
    setIsOpen(false);
    document.body.classList.remove('modal-open');
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      //search items with Command+K
      if (event.metaKey && event.key === 'k') {
        event.preventDefault();
        searchInputRef.current.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  //scroll to top on page refresh
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleButtonClick = () => {
    window.scrollTo(0, 0);
  };

  return (
    <>
      <div>
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog as="div" className="relative z-50 xl:hidden" onClose={setSidebarOpen}>
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-900/80" />
            </Transition.Child>
            <div className="fixed inset-0 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                      <button type="button" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen(false)}>
                        <span className="sr-only">Close sidebar</span>
                        <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                      </button>
                    </div>
                  </Transition.Child>
                  {/* Sidebar component, swap this element with another sidebar if you like */}
                  <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-[#f5f5f5] px-6 ring-1 ring-white/10">
                    <button
                      onClick={handleButtonClick}
                      className="h-16 pt-6"
                    >
                      <img
                        className="h-16 w-auto"
                        src="./vula.png"
                        alt="VULA logo"
                      />
                    </button>
                    <nav className="flex flex-1 flex-col py-12">
                      <ul className="flex flex-1 flex-col gap-y-2">
                        {Object.entries(rarityData).map(([category, items]) => (
                          <li key={category}>
                            <button
                              onClick={() => handleCategoryClick(category)}
                              className={classNames(
                                'group flex gap-x-3 rounded-md p-4 text-sm leading-6 font-semibold hover:bg-gray-200 w-full',
                                selectedCategories.includes(category) ? 'text-gray-400' : 'text-gray-400'
                              )}
                            >
                              <span className="h-6 w-6">
                                <PlusIcon
                                  className={classNames(
                                    'h-6 w-6 transform transition-all duration-200',
                                    openCategory === category ? 'rotate-180' : ''
                                  )}
                                  aria-hidden="true"
                                />
                              </span>
                              {category}
                            </button>
                            {openCategory === category && (
                              <ul className="pl-4 space-y-1">
                                {Object.entries(rarityData[category])
                                  .sort(([, a], [, b]) => b - a)
                                  .map(([item, value]) => (
                                    <li key={item}>
                                      <button
                                        onClick={() => handleFilterChange(category, item)}
                                        className={classNames(
                                          'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold items-center hover:bg-gray-200 w-full',
                                          selectedTraits.some((trait) => trait.category === category && trait.trait === item)
                                            ? 'text-gray-400'
                                            : 'text-gray-400'
                                        )}
                                      >
                                        <div className="flex flex-row w-full items-center justify-between focus:ring-0 focus:ring-none focus:outline-none ring-none outline-none">
                                          <div className="flex items-center">
                                            <input
                                              type="checkbox"
                                              checked={selectedTraits.some((trait) => trait.category === category && trait.trait === item)}
                                              className="h-4 w-4 rounded border-gray-300 cursor-pointer"
                                              onChange={() => handleFilterChange(category, item)}
                                            />

                                            <span className="pl-2">{item}</span>
                                          </div>
                                          <span>{value}</span>
                                        </div>
                                      </button>
                                    </li>
                                  ))}
                              </ul>
                            )}
                          </li>
                        ))}
                      </ul>
                    </nav>
                    <a
                      href="https://github.com/vulalabs/rarity"
                      className="pl-4 text-gray-400 text-[10px] pb-4 hover:text-gray-600 ease-in duration-300 flex flex-col"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div className="flex flex-row items-end">
                        <span>Open Source.</span>
                        <img src='./github.png' alt="GitHub Logo" className="ml-1 w-4" />
                      </div>
                      <span>© 2023 Vula Labs, Inc.</span>
                    </a>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>
        {/* Static sidebar for desktop */}
        <div className="hidden xl:fixed xl:inset-y-0 xl:z-10 xl:flex xl:w-72 xl:flex-col">
          {/* Sidebar component, swap this element with another sidebar if you like */}
          <div className="flex grow flex-col gap-y-5 overflow-y-auto px-6">
            <button
              onClick={handleButtonClick}
              className="h-16 pt-6"
            >
              <img
                className="h-16 w-auto"
                src="./vula.png"
                alt="VULA logo"
              />
            </button>
            <nav className="flex flex-1 flex-col py-12">
              <ul className="flex flex-1 flex-col gap-y-2">
                {Object.entries(rarityData).map(([category, items]) => (
                  <li key={category}>
                    <button
                      onClick={() => handleCategoryClick(category)}
                      className={classNames(
                        'group flex gap-x-3 rounded-md p-4 text-sm leading-6 font-semibold hover:bg-gray-200 w-full',
                        selectedCategories.includes(category) ? 'text-gray-400' : 'text-gray-400'
                      )}
                    >
                      <span className="h-6 w-6">
                        <PlusIcon
                          className={classNames(
                            'h-6 w-6 transform transition-all duration-200',
                            openCategory === category ? 'rotate-180' : ''
                          )}
                          aria-hidden="true"
                        />
                      </span>
                      {category}
                    </button>
                    {openCategory === category && (
                      <ul className="pl-4 space-y-1">
                        {Object.entries(rarityData[category])
                          .sort(([, a], [, b]) => b - a)
                          .map(([item, value]) => (
                            <li key={item}>
                              <button
                                onClick={() => handleFilterChange(category, item)}
                                className={classNames(
                                  'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold items-center hover:bg-gray-200 w-full',
                                  selectedTraits.some((trait) => trait.category === category && trait.trait === item)
                                    ? 'text-gray-400'
                                    : 'text-gray-400'
                                )}
                              >
                                <div className="flex flex-row w-full items-center justify-between focus:ring-0 focus:ring-none focus:outline-none ring-none outline-none">
                                  <div className="flex items-center">
                                    <input
                                      type="checkbox"
                                      checked={selectedTraits.some((trait) => trait.category === category && trait.trait === item)}
                                      className="h-4 w-4 rounded border-gray-300 cursor-pointer"
                                      onChange={() => handleFilterChange(category, item)}
                                    />

                                    <span className="pl-2">{item}</span>
                                  </div>
                                  <span>{value}</span>
                                </div>
                              </button>
                            </li>
                          ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
            <a
              href="https://github.com/vulalabs/rarity"
              className="pl-4 text-gray-400 text-[10px] pb-4 hover:text-gray-600 ease-in duration-300 flex flex-col"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="flex flex-row items-end">
                <span>Open Source.</span>
                <img src='./github.png' alt="GitHub Logo" className="ml-1 w-4" />
              </div>
              <span>© 2023 Vula Labs, Inc.</span>
            </a>
          </div>
        </div>
        <div className="xl:pl-72 relative">
          {/* Sticky search header */}
          <div className="sticky z-50 top-0 flex h-24 shrink-0 items-center mx-12">
            <div className={`absolute top-0 w-full h-20 z-20 bg-gradient-to-b from-[#f5f5f5] via-[#f5f5f5]/80 to-[#f5f5f5]/90 rounded-b-2xl flex items-center  ${isOpen ? 'hidden shadow-none ease-in duration-300' : ''}`} />
            <div className={`z-30 w-full flex h-16 items-center border bg-[#f5f5f5] rounded-2xl border-gray-200 shadow-sm px-4 sm:px-6 lg:px-8 ${isOpen ? 'hidden bg-transparent shadow-none border-opacity-0 ease-in duration-300' : 'shadow-md'}`}>
              <button type="button" className="-m-2.5 p-2.5 text-white xl:hidden" onClick={() => setSidebarOpen(true)}>
                <span className="sr-only">Open sidebar</span>
                <Bars3Icon className="h-5 w-5 text-gray-500 mr-2" aria-hidden="true" />
              </button>
              <div className={`block flex flex-1 gap-x-4 self-stretch lg:gap-x-6 ${isOpen ? 'hidden' : ''}`}>
                <form className="flex flex-1" action="#" method="GET">
                  <label htmlFor="search-field" className="sr-only">
                    VULA #
                  </label>
                  <div className="relative w-full flex flex-row items-center">
                    <MagnifyingGlassIcon
                      className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-500"
                      aria-hidden="true"
                    />
                    <input
                      id="search-field"
                      ref={searchInputRef}
                      className="block h-full w-full border-0 bg-transparent py-0 pl-8 pr-0 text-black focus:ring-0 focus:ring-none focus:outline-none ring-none outline-none text-sm lg:text-lg"
                      placeholder="VULA #"
                      type="search"
                      name="search"
                      onChange={handleSearch}
                    />
                    <div className="bg-gray-200 rounded-md px-2 py-1 font-semibold">
                      ⌘K
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="px-16 absolute">
            {selectedTraits.length > 0 && (
              <div className="flex flex-row items-center gap-x-3">
                <button
                  className="text-sm rounded-md text-gray-400 text-left"
                  onClick={() => {
                    setSelectedCategories([]); // Reset selected categories to 'All'
                    setSelectedTraits([]); // Reset selected traits to an empty array
                  }}
                >
                  Reset
                </button>
                <div className="flex items-center space-x-2">
                  {selectedCategories.map((categoryTrait) => (
                    <button
                      key={categoryTrait.category}
                      className="flex items-center space-x-1 text-gray-600 text-sm font-medium rounded-full border-2 border-gray-200 px-2 py-1"
                      onClick={() => {
                        setSelectedCategories((prevCategories) =>
                          prevCategories.filter((prevCategoryTrait) =>
                            prevCategoryTrait.category !== categoryTrait.category ||
                            prevCategoryTrait.trait !== categoryTrait.trait
                          )
                        );
                        setSelectedTraits((prevTraits) =>
                          prevTraits.filter((prevCategoryTrait) =>
                            prevCategoryTrait.category !== categoryTrait.category ||
                            prevCategoryTrait.trait !== categoryTrait.trait
                          )
                        );
                      }}
                    >
                      <span>{categoryTrait.category}: {categoryTrait.trait}</span>
                      <XMarkIcon className="w-3 text-gray-600" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="px-12 py-12">
            <InfiniteScroll
              dataLength={data.length}
              pageStart={0}
              loadMore={fetchMoreData}
              hasMore={items.length < filteredItems.length}
              loader={items.length < filteredItems.length ? <h3 className="text-gray-400 text-center mt-4">Loading...</h3> : null}
            >
              {items.length === 0 && filteredItems.length === 0 ? (
                <p className="text-center text-gray-600">No items to display.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                  {items.map((item, index) => {
                    const itemKey = Object.keys(data)[index];
                    return (
                      <div
                        key={itemKey}
                        onClick={() => openModal(item)}
                        className="cursor-pointer"
                      >
                        <div className="py-2 bg-white rounded-3xl">
                          <div className="overflow-hidden px-2 relative">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="object-cover object-center bg-white rounded-2xl"
                            />
                          </div>
                          <div className="px-4">
                            <div className="flex flex-row justify-between items-start text-sm text-gray-900 dark:text-white font-semibold pt-2 pb-1">
                              <a
                                href={`https://www.tensor.trade/item/${item.mintAddress}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-gray-700 cursor-pointer"
                              >
                                {item.name}
                              </a>
                              <p className="font-medium">R: {item.rank}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </InfiniteScroll>
          </div>
        </div>
      </div>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 flex items-center justify-center z-[99]" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>
          <div className="fixed z-[99] inset-0 overflow-y-auto">
            <div className="flex items-center justify-center p-4 text-center">
              {selectedItem &&
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="z-[99]  mt-4 w-full max-w-5xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <div className="flex flex-row justify-between items-center pb-4">
                      <Dialog.Title
                        as="h3"
                        className="text-lg lg:text-xl font-medium leading-6 text-gray-900"
                      >
                        {selectedItem && selectedItem.name}
                      </Dialog.Title>
                      {selectedItem &&
                        <div className="flex flex-row">
                          <a
                            href={`https://www.tensor.trade/item/${selectedItem.mintAddress}`}
                            className="flex flex-row text-gray-500 hover:opacity-80 ring:none outline:non focus:ring-none focus:outline-none pr-4 cursor-pointer"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img className="w-6 lg:w-8" src="./tensor.png" alt="Magic Eden logo" />
                          </a>
                          <a
                            href={`https://magiceden.io/item-details/${selectedItem.mintAddress}`}
                            className="flex flex-row text-gray-500 hover:opacity-80 ring:none outline:non focus:ring-none focus:outline-none pr-4 cursor-pointer"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img className="w-5 lg:w-7" src="./magiceden.svg" alt="Magic Eden logo" />
                          </a>
                        </div>
                      }
                    </div>
                    <div className="flex flex-row items-stretch">
                      <div className="w-1/2">
                        {selectedItem && (
                          <img
                            src={selectedItem.image}
                            alt={selectedItem.name}
                            className="w-full h-full rounded-2xl border-1 border-gray-200 shadow-sm"
                          />
                        )}
                      </div>
                      <div className="w-1/2 flex flex-col">
                        {selectedItem &&
                          selectedItem.attributes.map((attribute, index) => (
                            <div className="flex flex-col h-full px-3" key={index}>
                              <table className="w-full flex-grow">
                                <colgroup>
                                  <col style={{ width: "50%" }} />
                                  <col style={{ width: "50%" }} />
                                </colgroup>
                                <thead className="bg-white">
                                  <tr>
                                    <th scope="col" className="px-2 font-semibold text-gray-500 dark:text-white"></th>
                                    <th scope="col" className="px-2 font-semibold text-gray-500 dark:text-white"></th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr className="text-black text-center h-auto">
                                    <td className="text-left whitespace-nowrap bg-gray-200 py-1 pl-4 rounded-l-2xl">
                                      <p className="font-semibold text-xs lg:text-sm">{attribute.trait_category}</p>
                                    </td>
                                    <td className="whitespace-nowrap py-1 ring-1 ring-inset ring-gray-100 rounded-r-2xl">
                                      <p className="font-semibold text-xs lg:text-sm">{attribute.trait_info.trait}</p>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          ))}
                      </div>
                    </div>
                    <div className="mt-4">
                      <button
                        type="button"
                        className="relative inline-flex items-center justify-center text-gray-800 p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium rounded-lg group bg-gradient-to-br from-cyan-500/80 to-blue-500/80 group-hover:from-cyan-500/80 group-hover:to-blue-500/80 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-cyan-200"
                        onClick={() => closeModal(setSelectedItem(null))}
                      >
                        <span class="relative px-3 md:px-5 lg:px-5 py-1.5 md:py-2.5 lg:py-2.5 transition-all ease-in duration-200 bg-white rounded-md group-hover:bg-opacity-0">
                          Woah!
                        </span>
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              }
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}
