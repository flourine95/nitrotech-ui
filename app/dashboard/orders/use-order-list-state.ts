'use client';

import { useEffect, useState, useTransition } from 'react';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import type { DateRange } from 'react-day-picker';
import { useDebounce } from 'use-debounce';

import { parseSortParam } from '@/components/dashboard/multiple-sort-popover';
import {
  ALL,
  AMOUNT_MAX_MILLION,
  AMOUNT_MAX_VALUE,
  AMOUNT_MIN_MILLION,
  AMOUNT_MIN_VALUE,
  dateRangeFromParams,
  formatDateRangeParams,
  localDateEndExclusiveIso,
  localDateStartIso,
  toMillion,
} from './order-list-helpers';

export function useOrderListState() {
  const [search, setSearch] = useQueryState('search', parseAsString.withDefault(''));
  const [dateFrom, setDateFrom] = useQueryState('createdFrom', parseAsString.withDefault(''));
  const [dateTo, setDateTo] = useQueryState('createdTo', parseAsString.withDefault(''));
  const [statusFilter, setStatusFilter] = useQueryState('status', parseAsString.withDefault(ALL));
  const [paymentMethod, setPaymentMethod] = useQueryState('paymentMethod', parseAsString.withDefault(ALL));
  const [sortParam, setSortParam] = useQueryState('sort', parseAsString.withDefault('createdAt,desc'));
  const [currentPage, setCurrentPage] = useQueryState('page', parseAsInteger.withDefault(0));
  const [pageSize, setPageSize] = useQueryState('size', parseAsInteger.withDefault(10));
  const [amountMin, setAmountMin] = useQueryState('amountMin', parseAsInteger.withDefault(AMOUNT_MIN_VALUE));
  const [amountMax, setAmountMax] = useQueryState('amountMax', parseAsInteger.withDefault(AMOUNT_MAX_VALUE));

  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [draftRange, setDraftRange] = useState<DateRange | undefined>(undefined);
  const [searchInput, setSearchInput] = useState(search);
  const [amountRange, setAmountRange] = useState([toMillion(amountMin), toMillion(amountMax)]);
  const [isPending, startTransition] = useTransition();
  const [debouncedSearch] = useDebounce(searchInput, 350);
  const [debouncedAmountRange] = useDebounce(amountRange, 350);

  const sortRules = parseSortParam(sortParam);
  const createdFrom = dateFrom ? localDateStartIso(dateFrom) : undefined;
  const createdTo = dateTo ? localDateEndExclusiveIso(dateTo) : undefined;
  const hasAmountFilter = amountMin > AMOUNT_MIN_VALUE || amountMax < AMOUNT_MAX_VALUE;
  const amountMinValue = hasAmountFilter ? amountMin : undefined;
  const amountMaxValue = hasAmountFilter ? amountMax : undefined;
  const activeFilterCount =
    (statusFilter !== ALL ? 1 : 0) +
    (paymentMethod !== ALL ? 1 : 0) +
    (dateFrom ? 1 : 0) +
    (hasAmountFilter ? 1 : 0);
  const appliedRange: DateRange | undefined = dateRangeFromParams(dateFrom, dateTo);

  function openDatePopover() {
    setDraftRange(dateRangeFromParams(dateFrom, dateTo));
    setDatePopoverOpen(true);
  }

  function applyDateFilter() {
    const nextRange = formatDateRangeParams(draftRange);
    void setDateFrom(nextRange.from);
    void setDateTo(nextRange.to);
    void setCurrentPage(0);
    setDatePopoverOpen(false);
  }

  function clearAllFilters() {
    startTransition(() => {
      void setSearch('');
      setSearchInput('');
      void setStatusFilter(ALL);
      void setPaymentMethod(ALL);
      void setDateFrom('');
      void setDateTo('');
      void setAmountMin(AMOUNT_MIN_VALUE);
      void setAmountMax(AMOUNT_MAX_VALUE);
      setAmountRange([AMOUNT_MIN_MILLION, AMOUNT_MAX_MILLION]);
      void setSortParam('createdAt,desc');
      void setCurrentPage(0);
    });
  }

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    setAmountRange([toMillion(amountMin), toMillion(amountMax)]);
  }, [amountMin, amountMax]);

  useEffect(() => {
    if (searchInput === '') {
      if (search !== '') {
        void setSearch('');
        void setCurrentPage(0);
      }
      return;
    }
    if (debouncedSearch === search) return;
    void setSearch(debouncedSearch);
    void setCurrentPage(0);
  }, [debouncedSearch, search, searchInput, setCurrentPage, setSearch]);

  useEffect(() => {
    const nextMin = (debouncedAmountRange[0] ?? AMOUNT_MIN_MILLION) * 1_000_000;
    const nextMax = (debouncedAmountRange[1] ?? AMOUNT_MAX_MILLION) * 1_000_000;
    if (nextMin === amountMin && nextMax === amountMax) return;
    void setAmountMin(nextMin);
    void setAmountMax(nextMax);
    void setCurrentPage(0);
  }, [amountMax, amountMin, debouncedAmountRange, setAmountMax, setAmountMin, setCurrentPage]);

  return {
    state: {
      search,
      searchInput,
      dateFrom,
      dateTo,
      statusFilter,
      paymentMethod,
      sortParam,
      currentPage,
      pageSize,
      amountMin,
      amountMax,
      amountRange,
      datePopoverOpen,
      draftRange,
      isPending,
      sortRules,
      createdFrom,
      createdTo,
      amountMinValue,
      amountMaxValue,
      activeFilterCount,
      appliedRange,
    },
    actions: {
      setSearch,
      setSearchInput,
      setStatusFilter,
      setPaymentMethod,
      setSortParam,
      setCurrentPage,
      setPageSize,
      setAmountMin,
      setAmountMax,
      setAmountRange,
      setDatePopoverOpen,
      setDraftRange,
      startTransition,
      openDatePopover,
      applyDateFilter,
      clearAllFilters,
    },
  };
}
