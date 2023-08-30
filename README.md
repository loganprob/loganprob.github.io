## Getting Started
#### 1 - Open a new blank Excel workbook
#### 2 - Launch the Visual Basic Editor: (Alt+F11) OR (Developer > Visual Basic)
#### 3 - Create a new module: (Insert > Module) 
#### 4 - Copy and paste code below into the module
```
Public datadict
Private Sub Auto_Open()
    Dim user_response As String
    user_response = MsgBox("Import Security Info?", vbQuestion + vbYesNo)
    If user_response = vbYes Then
        APICaller
        RegisterCustomFunctions
    End If
End Sub
Sub APICaller()
    Dim objRequest As Object
    Dim strUrl As String
    Set objRequest = CreateObject("MSXML2.XMLHTTP")
    strUrl = "https://loganprob.github.io/sec_info.json"
    With objRequest
        .Open "GET", strUrl, True
        .SetRequestHeader "Content-Type", "application/json"
        .send
        While objRequest.readyState <> 4
            DoEvents
        Wend
        strResponse = .responseText
    End With
    ParseJSON (strResponse)
End Sub
Sub ParseJSON(strResponse)
    Dim splittler() As String
    newstr = Mid(strResponse, 2, Len(strResponse) - 3)
    splitter = Split(newstr, "}")
    Set datadict = CreateObject("Scripting.Dictionary")
    i = 0
    While i <= UBound(splitter) - 1
        pair = Split(splitter(i), "{")
        k = Trim(Replace(Replace(Replace(pair(0), ",", ""), ":", ""), Chr(34), ""))
        v = Split(pair(1), ",")
        Set vals = New Collection
        vals.Add Trim(Replace(Split(v(0), ":")(1), Chr(34), ""))
        vals.Add Trim(Replace(Split(v(1), ":")(1), Chr(34), ""))
        vals.Add Trim(Replace(Split(v(2), ":")(1), Chr(34), ""))
        vals.Add Trim(Replace(Split(v(3), ":")(1), Chr(34), ""))
        datadict.Add k, vals
        i = i + 1
    Wend
End Sub
Sub RegisterCustomFunctions()
    Application.MacroOptions _
        Macro:="TICKER", _
        Description:="Returns information about ETFs, Mutual Funds, and Stocks", _
        Category:="Logan - Custom Functions", _
        ArgumentDescriptions:=Array( _
            "Ticker Symbol", _
            "Return Type: 1=Name(Default), 2=MajorAssetClass, 3=SubAssetClass, 4=ExpenseRatio")
End Sub
Public Function TICKER(symbol As String, Optional return_type As Integer = 1) As Variant
    symbol = UCase(symbol)
    If datadict.Exists(symbol) Then
        If return_type = 1 Then
            TICKER = datadict.Item(symbol)(1)
        ElseIf return_type = 2 Then
            TICKER = datadict.Item(symbol)(2)
        ElseIf return_type = 3 Then
            TICKER = datadict.Item(symbol)(3)
        ElseIf return_type = 4 Then
            TICKER = datadict.Item(symbol)(4) / 100
        Else
            TICKER = "Unknown Return Type! (press CTRL+A while typing parameters to view descriptions of parameters)"
        End If
    Else
        TICKER = "could not find ticker... contact Logan"
    End If
End Function
```
### **IMPORTANT**
#### 4 - Save File (Ctrl+S) -> Change "Save as Type:" (below the File name) from "Excel Workbook" to "Excel Macro-Enabled Workbook"
#### 5 - Close the file (and the Visual Basic editor)
#### 6 - Open the file
#### 7 - Click "Enable Content" on the yellow "Security Warning" ribbon that appears
#### 8 - Click "Yes" when prompted by the "Import Security Info?" popup
#### 9 - Start using the data!


## Formula Usage
#### =TICKER (Symbol, [Return_type])
###### Parameters:
##### Symbol - _string_ - letters used to identify fund or stock
##### Return_type - _[1,2,3,4]_ - one of the integers to the left, specifies which data point the function returns:
      1 = Fund/Company Name 
      2 = Major Asset Class, one of:
          Equity
          Fixed Income
          Alternatives
          Cash
      3 = Sub Asset Class, one of:
          US Large Cap Core
          US Large Cap Value
          US Large Cap Growth
          US Mid Cap
          US Small Cap
          Intl Developed All/Value
          Intl Developed Growth
          Emerging Markets Equity
          US Core/Muni Bond
          US Long Duration
          US Short/Flexible Bond
          US TIPS
          US High Yield Corp/Muni
          Intl Developed Bonds
          Emerging Markets Bond
          Private Equity
          Real Estate
          Hedge Funds & Other
          Hedged Equity
          Real Assets
          Private Credit
          Cash
      4 = Expense Ratio of ETFs/Mutual Funds (to be formatted as a percentage)
            
###### loganprob.github.io
###### 8/26/23
