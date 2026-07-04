import type { Receipt } from "./api";

export const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export const money = (n: number) => "$" + n.toFixed(2);

export interface Sample {
  key: string;
  label: string;
  text: string;
}

export const SAMPLES: Sample[] = [
  {
    key: "cafe",
    label: "Cafe receipt",
    text: `CAFE VERONA
220 Hill St
Date: 09 January 2025
Receipt #: 28595
-----------------------------
2 x Cappuccino          $9.00
Sourdough Loaf x1       $5.50
Greek Salad          1 @ $8.00
-----------------------------
Subtotal            $22.50
Tax                 $1.80
AMOUNT DUE          $24.30
Thanks for shopping with us`,
  },
  {
    key: "hardware",
    label: "Hardware store",
    text: `PETE'S HARDWARE
88 Elm Avenue
Tel: (555) 210-2629
Date: Mar 04, 2025
Cashier: Jordan
-------------------------
Light Bulb 60W    3 @ $3.15
1 x USB-C Cable       $12.00
------------------------
BALANCE DUE         $21.45`,
  },
  {
    key: "grocery",
    label: "Grocery",
    text: `GREENLEAF MARKET
Store #14    12/23/24
============================
Bananas (bunch)      x1     $1.24
Whole Milk 1gal      x2     $7.98
Eggs Large Dozen            $4.49
Sourdough                   $5.00
----------------------------
SUBTOTAL                   $18.71
SALES TAX                   $1.31
TOTAL                      $20.02
Points earned: 20`,
  },
];

// The dashboard seeds with receipts the model has actually extracted, so the
// view is populated the instant the page loads. A live extraction appends to it.
// Only the fields the dashboard reads are kept; line_items is a length-only stand-in.
export const SEED_RECEIPTS: Receipt[] = [
  { vendor: "Corner Cafe", date: "2024-12-03", total: 16.17, line_items: len(3) },
  { vendor: "QuickMart", date: "2024-08-14", total: 19.72, line_items: len(3) },
  { vendor: "Corner Store", date: "2024-11-09", total: 6.75, line_items: len(3) },
  { vendor: "Burger Barn", date: "2025-01-02", total: 24.5, line_items: len(3) },
  { vendor: "Dollar Grocer", date: "2025-03-15", total: 8.49, line_items: len(3) },
  { vendor: "The Bistro", date: "2025-05-03", total: 46.96, line_items: len(2) },
];

function len(n: number) {
  return Array.from({ length: n }, () => ({ description: "", quantity: 1, price: 0 }));
}
