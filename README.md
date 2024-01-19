## Step 1. Prep

```
npm install 
export CLASP="node_modules/.bin/clasp"
```

## Step 2. Create a spreadsheet connected to your code

```
$CLASP login
$CLASP create --title "Gmail filters in a spreadsheet"
```
(select "sheets")
You will first have to enable scripts.

This creates a new spreadsheet and a new script.

## Step 3. Upload code.

```
$CLASP push
```

## Other useful commands

```
$CLASP open
$CLASP status
$CLASP pull
```


