//
// Copyright (c) 2009, Brian Frank and Andy Frank
// Licensed under the Academic Free License version 3.0
//
// History:
//   22 Junc 09  Andy Frank  Creation
//

/**
 * MimeType represents the parsed value of a Content-Type
 * header per RFC 2045 section 5.1.
 */
fan.sys.MimeType = fan.sys.Obj.$extend(fan.sys.Obj);
fan.sys.MimeType.prototype.$ctor = function() {}

//////////////////////////////////////////////////////////////////////////
// fromStr
//////////////////////////////////////////////////////////////////////////

fan.sys.MimeType.fromStr = function(s, checked)
{
  if (checked === undefined) checked = true;
  try
  {
    // common interned mime types
    switch (s.charAt(0))
    {
      case 'i':
        if (s == "image/png")  return fan.sys.MimeType.m_imagePng;
        if (s == "image/jpeg") return fan.sys.MimeType.m_imageJpeg;
        if (s == "image/gif")  return fan.sys.MimeType.m_imageGif;
        break;
      case 't':
        if (s == "text/plain") return fan.sys.MimeType.m_textPlain;
        if (s == "text/html")  return fan.sys.MimeType.m_textHtml;
        if (s == "text/xml")   return fan.sys.MimeType.m_textXml;
        if (s == "text/plain; charset=utf-8") return fan.sys.MimeType.m_textPlainUtf8;
        if (s == "text/html; charset=utf-8")  return fan.sys.MimeType.m_textHtmlUtf8;
        if (s == "text/xml; charset=utf-8")   return fan.sys.MimeType.m_textXmlUtf8;
        break;
      case 'x':
        if (s == "x-directory/normal") return fan.sys.MimeType.m_dir;
        break;
    }

    var slash = s.indexOf('/');
    var media = s.substring(0, slash);
    var sub = s.substring(slash+1, s.length);
    var params = fan.sys.MimeType.emptyParams();

    var semi = sub.indexOf(';');
    if (semi > 0)
    {
      params = fan.sys.MimeType.doParseParams(sub, semi+1);
      sub = fan.sys.Str.trim(sub.substring(0, semi));
    }

    var r = new fan.sys.MimeType();
    r.m_str = s;
    r.m_mediaType = fan.sys.Str.lower(media);
    r.m_subType   = fan.sys.Str.lower(sub);
    r.m_params    = params.ro();
    return r;
  }
  catch (err)
  {
    if (!checked) return null;
    throw fan.sys.ParseErr.makeStr("MimeType",  s);
  }
}

fan.sys.MimeType.parseParams = function(s, checked)
{
  if (checked === undefined) checked = true;
  try
  {
    // use local var to trap exception
    var v = fan.sys.MimeType.doParseParams(s, 0);
    return v;
  }
  catch (err)
  {
    if (!checked) return null;
    if (err instanceof fan.sys.ParseErr) throw err;
    throw fan.sys.ParseErr.makeStr("MimeType params",  s);
  }
}

fan.sys.MimeType.doParseParams = function(s, offset)
{
  var params = fan.sys.Map.make(fan.sys.Str.$type, fan.sys.Str.$type);
  params.caseInsensitive$(true);
  var inQuotes = false;
  var keyStart = offset;
  var valStart = -1;
  var valEnd   = -1;
  var eq       = -1;
  var hasEsc   = false;
  for (var i=keyStart; i<s.length; ++i)
  {
    var c = s.charAt(i);

    // let parens slide since sometimes they occur in cookies
    // if (c == '(' && !inQuotes)
    //   throw fan.sys.ParseErr.makeStr("MimeType", s, "comments not supported");

    if (c == '=' && eq < 0 && !inQuotes)
    {
      eq = i++;
      while (fan.sys.MimeType.isSpace(s, i)) ++i;
      if (s.charAt(i) == '"') { inQuotes = true; ++i; c = s.charAt(i); }
      else inQuotes = false;
      valStart = i;
    }

    if (c == ';' && eq < 0 && !inQuotes)
    {
      // key with no =val
      var key = fan.sys.Str.trim(s.substring(keyStart, i));
      params.set(key, "");
      keyStart = i+1;
      eq = valStart = valEnd = -1;
      hasEsc = false;
      continue;
    }

    if (eq < 0) continue;

    if (c == '\\' && inQuotes)
    {
      ++i;
      hasEsc = true;
      continue;
    }

    if (c == '"' && inQuotes)
    {
      valEnd = i-1;
      inQuotes = false;
    }

    if (c == ';' && !inQuotes)
    {
      if (valEnd < 0) valEnd = i-1;
      var key = fan.sys.Str.trim(s.substring(keyStart, eq));
      var val = fan.sys.Str.trim(s.substring(valStart, valEnd+1));
      if (hasEsc) val = fan.sys.MimeType.unescape(val);
      params.set(key, val);
      keyStart = i+1;
      eq = valStart = valEnd = -1;
      hasEsc = false;
    }
  }

  if (keyStart < s.length)
  {
    if (valEnd < 0) valEnd = s.length-1;
    if (eq < 0)
    {
      var key = fan.sys.Str.trim(s.substring(keyStart, s.length));
      params.set(key, "");
    }
    else
    {
      var key = fan.sys.Str.trim(s.substring(keyStart, eq));
      var val = fan.sys.Str.trim(s.substring(valStart, valEnd+1));
      if (hasEsc) val = fan.sys.MimeType.unscape(val);
      params.set(key, val);
    }
  }

  return params;
}

fan.sys.MimeType.isSpace = function(s, i)
{
  if (i >= s.length) throw fan.sys.IndexErr.make(i);
  return fan.sys.Int.isSpace(s.charCodeAt(i));
}

fan.sys.MimeType.unescape = function(s)
{
  var buf = "";
  for (var i=0; i<s.length; ++i)
  {
    var c = s.charAt(i);
    if (c != '\\') buf += c;
    else if (s.charAt(i+1) == '\\') { buf += '\\'; i++; }
  }
  return buf;
}

//////////////////////////////////////////////////////////////////////////
// Extension
//////////////////////////////////////////////////////////////////////////

fan.sys.MimeType.forExt = function(s)
{
  // TODO:FIXIT - we should really be loading this somehow from ext2mime.props
  if (s == null) return null;
  try
  {
    s = s.toLowerCase();
    var m = null;
    switch (s)
    {
      case "png": m = "image/png"; break;
      case "txt": m = "text/plain; charset=utf-8"; break ;
      case "text": m = "text/plain; charset=utf-8"; break;
    }
    // TODO FIXIT
    //return (MimeType)Repo.readSymbolsCached(etcUri, Duration.oneMin).get(FanStr.lower(s));
    return fan.sys.MimeType.fromStr(m);
  }
  catch (err)
  {
    fan.sys.ObjUtil.echo("MimeType.forExt: " + s);
    fan.sys.ObjUtil.echo(err);
    return null;
  }
}

//////////////////////////////////////////////////////////////////////////
// Identity
//////////////////////////////////////////////////////////////////////////

fan.sys.MimeType.prototype.equals = function(obj)
{
  if (obj instanceof fan.sys.MimeType)
  {
    return this.m_mediaType == obj.m_mediaType &&
           this.m_subType == obj.m_subType &&
           this.m_params.equals(obj.m_params);
  }
  return false;
}


fan.sys.MimeType.prototype.hash = function()
{
  return 0;
  //return this.mediaType.hashCode() ^
  //       this.subType.hashCode() ^
  //       this.params.hashCode();
}

fan.sys.MimeType.prototype.toStr = function() { return this.m_str; }

fan.sys.MimeType.prototype.$typeof = function() { return fan.sys.MimeType.$type; }

//////////////////////////////////////////////////////////////////////////
// Methods
//////////////////////////////////////////////////////////////////////////

fan.sys.MimeType.prototype.mediaType = function() { return this.m_mediaType; }
fan.sys.MimeType.prototype.subType = function() { return this.m_subType; }
fan.sys.MimeType.prototype.params = function() { return this.m_params; }

/*
fan.sys.MimeType.prototype.charset = function()
{
  String s = (String)params().get("charset");
  if (s == null) return Charset.utf8;
  return Charset.fromStr(s);
}
*/

fan.sys.MimeType.prototype.noParams = function()
{
  if (this.params.isEmpty()) return this;
  return fan.sys.MimeType.fromStr(this.mediaType() + "/" + this.subType());
}

//////////////////////////////////////////////////////////////////////////
// Lazy Load
//////////////////////////////////////////////////////////////////////////

fan.sys.MimeType.emptyParams = function()
{
  var q = fan.sys.MimeType.emptyQuery;
  if (q == null)
  {
    q = fan.sys.Map.make(fan.sys.Str.$type, fan.sys.Str.$type);
    q.caseInsensitive$(true);
    //q = q.toImmutable();
    fan.sys.MimeType.emptyQuery = q;
  }
  return q;
}
fan.sys.MimeType.emptyQuery = null;

//////////////////////////////////////////////////////////////////////////
// Predefined
//////////////////////////////////////////////////////////////////////////

fan.sys.MimeType.predefined = function(media, sub, params)
{
  if (params === undefined) params = "";
  var t = new fan.sys.MimeType();
  t.m_mediaType = media;
  t.m_subType = sub;
  t.m_params = fan.sys.MimeType.parseParams(params, true);
  t.m_str = media + "/" + sub;
  return t;
}

//////////////////////////////////////////////////////////////////////////
// Static Fields
//////////////////////////////////////////////////////////////////////////

// see sysPod.js

