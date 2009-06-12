//
// Copyright (c) 2008, Brian Frank and Andy Frank
// Licensed under the Academic Free License version 3.0
//
// History:
//   16 Jun 08  Brian Frank  Creation
//

**
** ColorTest
**
@javascript
class ColorTest : Test
{

  Void testMake()
  {
    c := Color(0xaabbcc)
    verifyEq(c.argb,  0xffaabbcc)
    verifyEq(c.rgb,   0xaabbcc)
    verifyEq(c.alpha, 0xff)
    verifyEq(c.r,     0xaa)
    verifyEq(c.g,     0xbb)
    verifyEq(c.b,     0xcc)
    verifyEq(c.toStr, "#aabbcc")

    verifyEq(c, Color.fromStr(c.toStr))
    verifyEq(c, Buf().writeObj(c).flip.readObj)

    c = Color(0xaabbccdd, true)
    verifyEq(c.argb,  0xaabbccdd)
    verifyEq(c.rgb,   0xbbccdd)
    verifyEq(c.alpha, 0xaa)
    verifyEq(c.r,     0xbb)
    verifyEq(c.g,     0xcc)
    verifyEq(c.b,     0xdd)
    verifyEq(c.toStr, "#aabbccdd")

    verifyEq(c, Color.fromStr(c.toStr))
    verifyEq(c, Buf().writeObj(c).flip.readObj)
  }

  Void testFromStr()
  {
    verifyEq(Color.fromStr("#abc"), Color(0xaabbcc))
    verifyEq(Color.fromStr("#345"), Color(0x334455))
    verifyEq(Color.fromStr("#a4b5c6"), Color(0xa4b5c6))
    verifyEq(Color.fromStr("#dea4b5c6"), Color(0xdea4b5c6, true))

    verifyEq(Color.fromStr("#abdc", false), null)
    verifyErr(ParseErr#) |,| { Color.fromStr("abc") }
    verifyErr(ParseErr#) |,| { Color.fromStr("#xyz", true) }
  }

  Void testEquals()
  {
    verifyEq(Color(0xaabbcc), Color(0xaabbcc))
    verifyEq(Color(0xaabbccdd, true), Color(0xaabbccdd, true))
    verifyNotEq(Color(0xaa0bcc), Color(0xaabbcc))
    verifyNotEq(Color(0xaabbcc), Color(0xaabbcc, true))
    verifyNotEq(Color(0x40aabbcc, true), Color(0x30aabbcc, true))
  }

  Void testToStr()
  {
    verifyEq(Color.black.toStr,  "#000000")
    verifyEq(Color.red.toStr,    "#ff0000")
    verifyEq(Color.blue.toStr,   "#0000ff")
    verifyEq(Color.orange.toStr, "#ffa500")
  }

  Void testToCss()
  {
    verifyEq(Color(0xaabbcc).toCss, "#aabbcc")
    verifyEq(Color(0x40aabbcc,true).toCss, "rgba(170,187,204,0.25)")
  }

}