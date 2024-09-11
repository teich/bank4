## Transactions
* Track spending, savings, and giving
* Transactions will have a description, date, amount, and category.
* Transactions will have a creator, who is the user that created the transaction.
    * parents could be creating transactions for their children
    * the system could create tranctions (e.g. automatic allowance)
        * system created transactions won't have a real userID in the database. Need someway to make this clear
* Transactions will be created by a user and added to a specific user + family.
    * a user can be in multiple families, and they should be kept seperate. 
    * for exaqmple if user a is in family 1 and 2, then they have 2 independent transaction logs.


## Allowance Settings
* Parents can set the allowance for their children
* Allowance is set per category, per child, per family.
* the categories are the same as above - spending, saving, giving
* allowance can be set as a fixed amount per week, or an annual percent.
    * e.g. $5/week for spendings, and 15% per year for savings
* Allowance settings should also be a transaction log. 
    * The most recent ones are the current ones
    * Allow us to see over time changes.
        * for example we might graph a childs weekly spending allowance 

## Requirements
* Default to USD, but set the stage for future currencies
* Every user should be able to select their currency in the future.
* store amounts as integers.
    * e.g. 1000 cents, 1000000 dollars
    * e.g. 15 percent is 15%
    * this allows for easy conversion between currencies
    * and for easy calculations (just use integer math)
* Each allowance setting has a period, which can be a week, month, year



