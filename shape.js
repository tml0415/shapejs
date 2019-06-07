
(function (factory) {
    if (typeof exports === 'object') {module.exports = factory();// Node/CommonJS
    } else if (typeof define === 'function' && define.amd) {define(factory);// AMD
    } else {  // Browser globals (with support for web workers)
        var glob;
        try {glob = window;} catch (e) {glob = self;}
        glob.ShpFile = factory();
    }
}(function (undefined) {
    class geojson 
    {
        constructor() {
            this.type='FeatureCollection'
            this.features=[];
        }
        AddFeature(properties,geometry){
            let feature=new ShpFile.Feature();
            feature.AddPropertie(properties)
            feature.AddGeometry(geometry)
            this.features.push(feature);

        }
    }
    class Feature 
    {
        constructor() {
            this.type='Feature'
            this.properties={};
            this.geometry={};
        }
        AddPropertie(properties){
            this.properties=properties;
        }
        AddGeometry(geometry){
            let type=geometry.type;
            if(type=='point'){
                this.geometry.coordinates=[geometry.x,geometry.y]
                this.geometry.type="Point"
            }
            else if(type=='MultiPoint' && Array.isArray(geometry))
            {
                this.geometry.coordinates=[];
                for (let key of geometry) {
                    this.geometry.push([key.x,key.y])
                }
                this.geometry.type="MultiPoint"
                
            }
            else if(type=='polyline'){ polyline
                this.geometry.coordinates=geometry.paths
                this.geometry.type="LineString"
            }
            else if(type=='MultiLineString' && Array.isArray(geometry)){
                this.geometry=[];
                for (let key of geometry) {
                    this.geometry.push([key.paths])
                }
            }
            else if(type=='polygon'){
                this.geometry.coordinates=geometry.rings
                this.geometry.type="Polygon"
            }
            else if(type=='MultiPlygon' && Array.isArray(geometry)){
                this.geometry=[];
                for (let key of geometry) {
                    this.geometry.push([key.rings])
                }
            }
            
        }
    }
    var ShpFile=function(){};
    ShpFile.geojson=geojson;
    ShpFile.Feature=Feature;
    ShpFile.files={
        shpFile:"",
        dbfFile:"",
        type:'arcgis'//geojson
    };
    ShpFile.dbf={};

    ShpFile.data={};
    ShpFile.data.shps=[];
    ShpFile.data.dbfs=[];
    ShpFile.loading={};

    ShpFile.init=async function(options){
        ShpFile.files.shpFile=""||options.shpfile
        ShpFile.files.dbfFile=""||options.dbffile
        ShpFile.files.type=options.type ||"arcgis"
        
        ShpFile.reset();
        let read_data= await ShpFile.read_files();
        if(read_data[0]==true &&read_data[1]==true){
            ShpFile.load_Header()
            return ShpFile.load();
        }
        else{
            return read_data;
        }
    }
    ShpFile.reset=function(){
        ShpFile.loading.shpdataOffset=0;
        ShpFile.loading.shpdataLength =0;
        ShpFile.loading.shpdata= null;
        ShpFile.loading.dbfdataOffset=0;
        ShpFile.loading.dbfdataLength =0;
        ShpFile.loading.dbfdata= null;
        ShpFile.shapeTypeString="";
    }
    ShpFile.read_files=function(){
        return Promise.all([ShpFile.FileReader_shp(),ShpFile.FileReader_dbf()])
    }
    ShpFile.load_Header=function(){
        ShpFile.Load_shp_Header(), ShpFile.Load_dbf_Header()
    }
    ShpFile.load=function(){
        ShpFile.data.shps=[];
        ShpFile.data.dbfs=[];
        return new Promise(function(resolve, reject){
            Promise.all([ShpFile.Load_shp_Records(),ShpFile.Load_dbf()])
            .then(data=>{
                if(data[0]==true &&data[1]==true && ShpFile.data.shps.length==ShpFile.data.dbfs.length){
                    let back=[];
                    if(ShpFile.files.type=='geojson')
                    {
                        back=new ShpFile.geojson();
                    }
                    for (let index = 0; index < ShpFile.data.shps.length; index++) {
                        if(ShpFile.files.type=='geojson')
                        {
                            back.AddFeature(ShpFile.data.dbfs[index],ShpFile.data.shps[index])
                        }
                        else{
                            back.push({
                                geometry:ShpFile.data.shps[index],
                                attributes:ShpFile.data.dbfs[index]
                            })
                        }
                    }
                    resolve({
                        data:back,
                        shapeType:ShpFile.shapeTypeString
                    });
                }
                else{
                    reject(false)
                }
            })
        });
    }
    ShpFile.FileReader_shp=function(){
        return new Promise(function(resolve, rejectshp)
        {
            if(ShpFile.files.shpFile!="")
            {
                var reader = new FileReader();
                reader.onload = function(e) {
                    var text = reader.result;
                    ShpFile.loading.shpdataOffset=0;
                    if(text.byteLength<100){
                        resolve("shp文件不能小于100字节！");
                    }
                    ShpFile.loading.shpdataLength =text.byteLength;
                    ShpFile.loading.shpdata= new DataView(text, 0, text.byteLength);
                    resolve(true)
                }
                reader.readAsArrayBuffer(ShpFile.files.shpFile);
            }
            else{
                resolve(false)
            }
            
        });
    }
    ShpFile.FileReader_dbf=function(){
        return new Promise(function(resolve, reject)
        {
            if(ShpFile.files.dbfFile!="")
            {
                var reader = new FileReader();
                reader.onload = function(e) {
                    var text = reader.result;
                    ShpFile.loading.shpdataOffset=0;
                    if(text.byteLength<65){
                        resolve("dbf文件不能小于100字节！");
                    }
                    ShpFile.loading.dbfdataLength =text.byteLength;
                    ShpFile.loading.dbfdata= new DataView(text, 0, text.byteLength);
                    resolve(true)
                }
                reader.readAsArrayBuffer(ShpFile.files.dbfFile);
            }
            else{
                resolve(false)
            }
            
        });
    }
    ShpFile.Load_shp_Header=function(){
        var i_00_03=ShpFile.loading.shpdata.getUint32(ShpFile.loading.shpdataOffset,!1); ShpFile.loading.shpdataOffset+=4;
        var i_04_07 =ShpFile.loading.shpdata.getUint32(ShpFile.loading.shpdataOffset,!1);ShpFile.loading.shpdataOffset+=4;
        var i_08_11 =ShpFile.loading.shpdata.getUint32(ShpFile.loading.shpdataOffset,!1);ShpFile.loading.shpdataOffset+=4;
        var i_12_15 =ShpFile.loading.shpdata.getUint32(ShpFile.loading.shpdataOffset,!1);ShpFile.loading.shpdataOffset+=4;
        var i_16_19 =ShpFile.loading.shpdata.getUint32(ShpFile.loading.shpdataOffset,!1);ShpFile.loading.shpdataOffset+=4;
        var i_20_23 =ShpFile.loading.shpdata.getUint32(ShpFile.loading.shpdataOffset,!1);ShpFile.loading.shpdataOffset+=4;
        //文件的实际长度
        var i_24_27 =ShpFile.loading.shpdata.getUint32(ShpFile.loading.shpdataOffset,!1);ShpFile.loading.shpdataOffset+=4;
        //版本号
        var i_28_31 =ShpFile.loading.shpdata.getUint32(ShpFile.loading.shpdataOffset,!0);ShpFile.loading.shpdataOffset+=4;
        //几何类型
        ShpFile.loading.shapeType =ShpFile.loading.shpdata.getInt32(ShpFile.loading.shpdataOffset,!0);ShpFile.loading.shpdataOffset+=4;
        //Xmin
        var d_36_43 =ShpFile.loading.shpdata.getFloat64(ShpFile.loading.shpdataOffset,!0);ShpFile.loading.shpdataOffset+=8;
        //Ymin 
        var d_44_51 =ShpFile.loading.shpdata.getFloat64(ShpFile.loading.shpdataOffset,!0);ShpFile.loading.shpdataOffset+=8;
        //Xmax
        var d_52_59 =ShpFile.loading.shpdata.getFloat64(ShpFile.loading.shpdataOffset,!0);ShpFile.loading.shpdataOffset+=8;
        //Ymax 
        var d_60_67 =ShpFile.loading.shpdata.getFloat64(ShpFile.loading.shpdataOffset,!0);ShpFile.loading.shpdataOffset+=8;
        //Zmin
        var d_68_75 =ShpFile.loading.shpdata.getFloat64(ShpFile.loading.shpdataOffset,!0);ShpFile.loading.shpdataOffset+=8;
        //Zmax 
        var d_76_83 =ShpFile.loading.shpdata.getFloat64(ShpFile.loading.shpdataOffset,!0);ShpFile.loading.shpdataOffset+=8;
        //Mmin
        var d_84_91 =ShpFile.loading.shpdata.getFloat64(ShpFile.loading.shpdataOffset,!0);ShpFile.loading.shpdataOffset+=8;
        //Mmax
        var d_92_99 =ShpFile.loading.shpdata.getFloat64(ShpFile.loading.shpdataOffset,!0);ShpFile.loading.shpdataOffset+=8;
        //解析头文件完毕！
        return "";
    }
    ShpFile.Load_shp_Records=function(){
        ShpFile.data.shps=[];
        return new Promise(function(resolve, reject){
            switch(ShpFile.loading.shapeType) {
                case ShpType.SHAPE_POINT:
                    ShpFile.shapeTypeString="point";
                    ShpFile.Load_SHAPE_POINT();
                    resolve(true)
                    break;
                case ShpType.SHAPE_POINTZ:
                    this.shape = new ShpPointZ(src, this.contentLengthBytes);
                    break;
                case ShpType.SHAPE_POLYGON:
                    ShpFile.shapeTypeString="polygon";
                    ShpFile.Load_SHAPE_POLYGON();
                    resolve(true)
                    break;
                case ShpType.SHAPE_POLYLINE:
                    ShpFile.shapeTypeString="polyline";
                    ShpFile.Load_SHAPE_POLYLINE();
                    resolve(true)
                    break;
                case ShpType.SHAPE_MULTIPATCH:
                case ShpType.SHAPE_MULTIPOINT:
                case ShpType.SHAPE_MULTIPOINTM:
                case ShpType.SHAPE_MULTIPOINTZ:
                case ShpType.SHAPE_POINTM:
                case ShpType.SHAPE_POLYGONM:
                case ShpType.SHAPE_POLYGONZ:
                case ShpType.SHAPE_POLYLINEZ:
                case ShpType.SHAPE_POLYLINEM:
                    reject(this.shapeType+" Shape type is currently unsupported by this library");
                    break;  
                default:        
                    reject("Encountered unknown shape type ("+this.shapeType+")");
                    break;
            }
        })
       
        
    }
    ShpFile.Load_SHAPE_POINT=function(){
        while (ShpFile.loading.shpdataOffset<ShpFile.loading.shpdataLength)
        {
            var thisp=new arcgisPoint();
            var index=ShpFile.loading.shpdata.getUint32(ShpFile.loading.shpdataOffset,!1); ShpFile.loading.shpdataOffset+=4;//记录号 记录号都是从1开始的,下面1行代码是反转位序
            var leng=ShpFile.loading.shpdata.getUint32(ShpFile.loading.shpdataOffset,!1); ShpFile.loading.shpdataOffset+=4; //坐标记录长度,是不是为坐标的小数点位数？
            var i_ShapeType =ShpFile.loading.shpdata.getInt32(ShpFile.loading.shpdataOffset,!0);ShpFile.loading.shpdataOffset+=4;//坐标表示的类型
            thisp.x =ShpFile.loading.shpdata.getFloat64(ShpFile.loading.shpdataOffset,!0);ShpFile.loading.shpdataOffset+=8;//当前要素的X
            thisp.y =ShpFile.loading.shpdata.getFloat64(ShpFile.loading.shpdataOffset,!0);ShpFile.loading.shpdataOffset+=8;//当前要素的Y
            ShpFile.data.shps.push(thisp);
        }
    }
    ShpFile.Load_SHAPE_POLYGON=function(){
        while (ShpFile.loading.shpdataOffset<ShpFile.loading.shpdataLength)
        {
            var thisp=new arcgisPolygon();
            thisp.rings=[];
            //记录的头
            var index=ShpFile.loading.shpdata.getUint32(ShpFile.loading.shpdataOffset,!1); ShpFile.loading.shpdataOffset+=4; 
            var leng=ShpFile.loading.shpdata.getUint32(ShpFile.loading.shpdataOffset,!1); ShpFile.loading.shpdataOffset+=4; //坐标记录长度,是不是为坐标的小数点位数？
            var i_ShapeType =ShpFile.loading.shpdata.getInt32(ShpFile.loading.shpdataOffset,!0);ShpFile.loading.shpdataOffset+=4;
            var Xmin =ShpFile.loading.shpdata.getFloat64(ShpFile.loading.shpdataOffset,!0);ShpFile.loading.shpdataOffset+=8;
            var Ymin =ShpFile.loading.shpdata.getFloat64(ShpFile.loading.shpdataOffset,!0);ShpFile.loading.shpdataOffset+=8;
            var Xmax =ShpFile.loading.shpdata.getFloat64(ShpFile.loading.shpdataOffset,!0);ShpFile.loading.shpdataOffset+=8;
            var Ymax=ShpFile.loading.shpdata.getFloat64(ShpFile.loading.shpdataOffset,!0);ShpFile.loading.shpdataOffset+=8;
            var NumParts=ShpFile.loading.shpdata.getUint32(ShpFile.loading.shpdataOffset,!0);ShpFile.loading.shpdataOffset+=4;
            var NumPoints=ShpFile.loading.shpdata.getUint32(ShpFile.loading.shpdataOffset,!0);ShpFile.loading.shpdataOffset+=4;
            var Parts=[];
            //Parts数组记录了每个子环的坐标在Points数组中的起始位置
            for (var i = 0; i < NumParts; i++)
            {
                var offset=ShpFile.loading.shpdata.getInt32(ShpFile.loading.shpdataOffset,!0);ShpFile.loading.shpdataOffset+=4;
                Parts.push(offset);  //每个子环的坐标在Points数组中的起始位置
            }
            //Points数组 记录了所有的坐标信息
            var Points = [];
            for (var i = 0; i < NumPoints; i++)
            {
                var shppoint={};
                shppoint.x = ShpFile.loading.shpdata.getFloat64(ShpFile.loading.shpdataOffset,!0);ShpFile.loading.shpdataOffset+=8;
                shppoint.y =ShpFile.loading.shpdata.getFloat64(ShpFile.loading.shpdataOffset,!0);ShpFile.loading.shpdataOffset+=8;
                Points.push(shppoint);
            }
            var rings=[];
            for (var j = 0; j < NumParts; j++)
            {
                var i_start =Parts[j];
                var one_polygon=[];
                var i_end = 0;
                if (j + 1 < NumParts)
                {
                    i_end = Parts[j + 1];
                }
                else
                {
                    i_end = Points.length;
                }
                for (var i = i_start; i < i_end; i++)
                {
                    var shppoint = Points[i];
                    var one_polygon_one_point = [];
                    //如果存在的是平面坐标需要修改成为经纬度坐标  以后改
                    one_polygon_one_point.push(shppoint.x);one_polygon_one_point.push(shppoint.y);
                    one_polygon.push(one_polygon_one_point);
                }
                //因为shp文件存储的坐标点 在一个面上 第一个点和最后一个点相同 arcgis api 不能重复
                one_polygon.pop(one_polygon.length - 1);
                rings.push(one_polygon);
            }
            thisp.rings=rings;
            ShpFile.data.shps.push(thisp);

    }
    }
    ShpFile.Load_SHAPE_POLYLINE=function(){
        while (ShpFile.loading.shpdataOffset<ShpFile.loading.shpdataLength)
        {
            var thisp=new arcgisPolyline();
            thisp.paths=[];
            //记录的头
            var index=ShpFile.loading.shpdata.getUint32(ShpFile.loading.shpdataOffset,!1); ShpFile.loading.shpdataOffset+=4; 
            var leng=ShpFile.loading.shpdata.getUint32(ShpFile.loading.shpdataOffset,!1); ShpFile.loading.shpdataOffset+=4; //坐标记录长度,是不是为坐标的小数点位数？
            var i_ShapeType =ShpFile.loading.shpdata.getInt32(ShpFile.loading.shpdataOffset,!0);ShpFile.loading.shpdataOffset+=4;
            var Xmin =ShpFile.loading.shpdata.getFloat64(ShpFile.loading.shpdataOffset,!0);ShpFile.loading.shpdataOffset+=8;
            var Ymin =ShpFile.loading.shpdata.getFloat64(ShpFile.loading.shpdataOffset,!0);ShpFile.loading.shpdataOffset+=8;
            var Xmax =ShpFile.loading.shpdata.getFloat64(ShpFile.loading.shpdataOffset,!0);ShpFile.loading.shpdataOffset+=8;
            var Ymax=ShpFile.loading.shpdata.getFloat64(ShpFile.loading.shpdataOffset,!0);ShpFile.loading.shpdataOffset+=8;
            var NumParts=ShpFile.loading.shpdata.getUint32(ShpFile.loading.shpdataOffset,!0);ShpFile.loading.shpdataOffset+=4;
            var NumPoints=ShpFile.loading.shpdata.getUint32(ShpFile.loading.shpdataOffset,!0);ShpFile.loading.shpdataOffset+=4;
            var Parts=[];
            //Parts数组记录了每个子环的坐标在Points数组中的起始位置
            for (var i = 0; i < NumParts; i++)
            {
                var offset=ShpFile.loading.shpdata.getInt32(ShpFile.loading.shpdataOffset,!0);ShpFile.loading.shpdataOffset+=4;
                Parts.push(offset);  //每个子环的坐标在Points数组中的起始位置
            }
            //Points数组 记录了所有的坐标信息
            var Points = [];
            for (var i = 0; i < NumPoints; i++)
            {
                var shppoint={};
                shppoint.x = ShpFile.loading.shpdata.getFloat64(ShpFile.loading.shpdataOffset,!0);ShpFile.loading.shpdataOffset+=8;
                shppoint.y =ShpFile.loading.shpdata.getFloat64(ShpFile.loading.shpdataOffset,!0);ShpFile.loading.shpdataOffset+=8;
                Points.push(shppoint);
            }
            var rings=[];
            for (var j = 0; j < NumParts; j++)
            {
                var i_start =Parts[j];
                var one_polygon=[];
                var i_end = 0;
                i_end=(j + 1 < NumParts)?Parts[j + 1]:i_end = Points.length;
                
                for (var i = i_start; i < i_end; i++)
                {
                    var shppoint = Points[i];
                    var one_polygon_one_point = [];
                    //如果存在的是平面坐标需要修改成为经纬度坐标  以后改
                    one_polygon_one_point.push(shppoint.x);one_polygon_one_point.push(shppoint.y);
                    one_polygon.push(one_polygon_one_point);
                }
                rings.push(one_polygon);
            }
            thisp.paths=rings;
            ShpFile.data.shps.push(thisp);
    }
    }
    ShpFile.Load_dbf_Header=function(){
        //读取dbf头文件 不定长字节
        var i_0 =ShpFile.loading.dbfdata.getInt8(ShpFile.loading.dbfdataOffset,!0); ShpFile.loading.dbfdataOffset+=1;//表示当前的版本信息
        ShpFile.loading.dbfdataOffset+=3;//表示最近的更新日期，按照YYMMDD格式。
        ShpFile.dbf.count=ShpFile.loading.dbfdata.getUint32(ShpFile.loading.dbfdataOffset,!0); ShpFile.loading.dbfdataOffset+=4; //记录条数
        ShpFile.dbf.Headerbytecount=ShpFile.loading.dbfdata.getUint16(ShpFile.loading.dbfdataOffset,!0);ShpFile.loading.dbfdataOffset+=2;//文件头中的字节数
        var i_10_11 =ShpFile.loading.dbfdata.getUint16(ShpFile.loading.dbfdataOffset,!0);ShpFile.loading.dbfdataOffset+=2; //一条记录中的字节长度
        ShpFile.loading.dbfdataOffset+=2;//2个字节	保留字节，用于以后添加新的说明性信息时使用，这里用0来填写。
        ShpFile.loading.dbfdataOffset+=1;//表示未完成的操作。
        ShpFile.loading.dbfdataOffset+=1;//dBASE IV编密码标记。
        ShpFile.loading.dbfdataOffset+=12;//保留字节，用于多用户处理时使用
        ShpFile.loading.dbfdataOffset+=1;//DBF文件的MDX标识。在创建一个DBF 表时 ，如果使用了MDX 格式的索引文件，那么 DBF 表的表头中的这个字节就自动被设置了一个标志，当你下次试图重新打开这个DBF表的时候，数据引擎会自动识别这个标志，如果此标志为真，则数据引擎将试图打开相应的MDX 文件
        ShpFile.loading.LDID=ShpFile.loading.dbfdata.getInt8(ShpFile.loading.dbfdataOffset,!0);//Language driver ID. 29  编码字节
        ShpFile.loading.dbfdataOffset+=1;
        ShpFile.loading.dbfdataOffset+=2;//保留字节，用于以后添加新的说明性信息时使用，这里用0来填写。
        var d_sxnum=(ShpFile.dbf.Headerbytecount - 1 - 32) / 32;//计算出属性列的个数
        var fileds=[];
        for (var i = 0; i < d_sxnum;i ++ )
        {
            let filed={};
            var namebyte=new Uint8Array(ShpFile.loading.dbfdata.buffer, ShpFile.loading.dbfdataOffset, 11); ShpFile.loading.dbfdataOffset+=11;//记录项名称，是ASCII码值。
            var valuebyte=[];
            namebyte.forEach(function(value) {if(value!=32 && value!=0){valuebyte.push(value);}})
            filed.name = ShpFile.ByteToStr(valuebyte);
            filed.type=new Uint8Array(ShpFile.loading.dbfdata.buffer, ShpFile.loading.dbfdataOffset, 1)[0];ShpFile.loading.dbfdataOffset+=1;//记录项的数据类型，是ASCII码值(B、C、D、G、L、M和N) 列的字段类型
            ShpFile.loading.dbfdataOffset+=4;//保留字节，用于以后添加新的说明性信息时使用，这里用0来填写
            var lengthU=new Uint8Array(ShpFile.loading.dbfdata.buffer, ShpFile.loading.dbfdataOffset, 1);ShpFile.loading.dbfdataOffset+=1;//记录项长度，二进制型
            filed.Length=lengthU[0];

            ShpFile.loading.dbfdataOffset+=1;//记录项的精度，二进制型
            ShpFile.loading.dbfdataOffset+=2;//保留字节，用于以后添加新的说明性信息时使用，这里用0来填写
            ShpFile.loading.dbfdataOffset+=1;//工作区ID
            ShpFile.loading.dbfdataOffset+=10;//保留字节，用于以后添加新的说明性信息时使用，这里用0来填写
            ShpFile.loading.dbfdataOffset+=1;//MDX标识。如果存在一个MDX 格式的索引文件，那么这个记录项为真，否则为空
            fileds.push(filed);
        }
        ShpFile.dbf.fileds=fileds;
        ShpFile.loading.dbfdataOffset+=1;//记录项终止标识
    }
    ShpFile.Load_dbf=function(){
        ShpFile.data.dbfs=[];
        return new Promise(function(resolve, reject){
            var values=[];
            for (var i = 0; i < ShpFile.dbf.count;i ++ )
            {
                ShpFile.loading.dbfdataOffset+=1;//第一个字节是删除标志，若记录被删除，则该字节为0x2A即"*"；否则为0x20即空格
                let onevalue={};
                for (var j = 0; j < ShpFile.dbf.fileds.length;j ++ )
                {
                    var name = ShpFile.dbf.fileds[j].name;
                    var length = ShpFile.dbf.fileds[j].Length;
                    var type = ShpFile.dbf.fileds[j].type;
                    var valuebyte2=new Uint8Array(ShpFile.loading.dbfdata.buffer, ShpFile.loading.dbfdataOffset, length);//记录项值。
                    ShpFile.loading.dbfdataOffset+=length;
                    var valuebyte=[];
                    valuebyte2.forEach(function( value, index ) {if(value!=32 && value!=0){valuebyte.push(value);}})
                    var value = ShpFile.dbf_field_convert(valuebyte,type);
                    onevalue[name]=value;
                }
                values.push(onevalue)
            }
            ShpFile.data.dbfs=values;
            resolve(true)
        });
        
    }
    ShpFile.Load_shx=function(readbyid){
        //读取dbf头文件 不定长字节
        ShpFile.loading.shxdataOffset=100; //忽略100字节头文件
        ShpFile.loading.shxdataOffset+=readbyid*8;
        var i_00_03 =ShpFile.loading.shxdata.getUint32(ShpFile.loading.shxdataOffset,!1); ShpFile.loading.shxdataOffset+=4; //Offset
        var i_04_07 =ShpFile.loading.shxdata.getUint32(ShpFile.loading.shxdataOffset,!1); ShpFile.loading.shxdataOffset+=4; //Content Length）
        //ShpFile.loading.shpdataOffset=i_00_03;
    }
    ShpFile.dbf_field_convert=function(valuebyte,fieldtype){
        switch(fieldtype) {
            case ShapeFieldType.SHAPE_B: //Double 。
                return new Number(String.fromCharCode.apply(null, valuebyte)).valueOf();
            case ShapeFieldType.SHAPE_C: //字符型	各种字符。
                return ShpFile.ByteToStr(valuebyte);
            case ShapeFieldType.SHAPE_D: // 日期型	用于区分年、月、日的数字和一个字符，内部存储按照YYYYMMDD格式。
                return ShpFile.ByteToStr(valuebyte);
            case ShapeFieldType.SHAPE_F: // Float
                return new Number(String.fromCharCode.apply(null, valuebyte)).valueOf();
            case ShapeFieldType.SHAPE_G: // (General or OLE)	各种字符。
                return String.fromCharCode.apply(null, valuebyte)
            case ShapeFieldType.SHAPE_N: // 数值型(Numeric)	- . 0 1 2 3 4 5 6 7 8 9 
                return new Number( String.fromCharCode.apply(null, valuebyte)).valueOf();
            case ShapeFieldType.SHAPE_I: // Integer
                return new Number(String.fromCharCode.apply(null, valuebyte)).valueOf();
            case ShapeFieldType.SHAPE_L: // 逻辑型（Logical）	? Y y N n T t F f (? 表示没有初始
                break;
            case ShapeFieldType.SHAPE_M: // (Memo)	各种字符。
                break;
            case ShapeFieldType.SHAPE_T: //  DateTime
                break;
            case ShapeFieldType.SHAPE_P: // Picture
                break;
            case ShapeFieldType.SHAPE_Y: //货币
                break;
            default:  
                throw(new ShpError(this.shapeType+" Shape type is currently unsupported by this library"));
        }
    }
    ShpFile.ByteToStr=function(utf8Bytes){
        switch(ShpFile.loading.LDID) {
            case LDID.UTF_16:
                break;
            case LDID.UTF_8:
                break;
            case LDID.ASNI:
                let gggg=gbk2312.decode(utf8Bytes);
                return gggg
            default:        
                throw(new Error("Encountered unknown  Language driver ID ("+ShpFile.loading.LDID+")"));
        }
        var unicodeStr ="";
        for (var pos = 0; pos < utf8Bytes.length;){
            var flag= utf8Bytes[pos];
            var unicode = 0 ;
            if ((flag >>>7) === 0 ) {
                unicodeStr+= String.fromCharCode(utf8Bytes[pos]);
                pos += 1;

            } else if ((flag & 0xFC) === 0xFC ){
                unicode = (utf8Bytes[pos] & 0x3) << 30;
                unicode |= (utf8Bytes[pos+1] & 0x3F) << 24;
                unicode |= (utf8Bytes[pos+2] & 0x3F) << 18;
                unicode |= (utf8Bytes[pos+3] & 0x3F) << 12;
                unicode |= (utf8Bytes[pos+4] & 0x3F) << 6;
                unicode |= (utf8Bytes[pos+5] & 0x3F);
                unicodeStr+= String.fromCharCode(unicode) ;
                pos += 6;

            }else if ((flag &0xF8) === 0xF8 ){
                unicode = (utf8Bytes[pos] & 0x7) << 24;
                unicode |= (utf8Bytes[pos+1] & 0x3F) << 18;
                unicode |= (utf8Bytes[pos+2] & 0x3F) << 12;
                unicode |= (utf8Bytes[pos+3] & 0x3F) << 6;
                unicode |= (utf8Bytes[pos+4] & 0x3F);
                unicodeStr+= String.fromCharCode(unicode) ;
                pos += 5;

            } else if ((flag &0xF0) === 0xF0 ){
                unicode = (utf8Bytes[pos] & 0xF) << 18;
                unicode |= (utf8Bytes[pos+1] & 0x3F) << 12;
                unicode |= (utf8Bytes[pos+2] & 0x3F) << 6;
                unicode |= (utf8Bytes[pos+3] & 0x3F);
                unicodeStr+= String.fromCharCode(unicode) ;
                pos += 4;

            } else if ((flag &0xE0) === 0xE0 ){
                unicode = (utf8Bytes[pos] & 0x1F) << 12;;
                unicode |= (utf8Bytes[pos+1] & 0x3F) << 6;
                unicode |= (utf8Bytes[pos+2] & 0x3F);
                unicodeStr+= String.fromCharCode(unicode) ;
                pos += 3;

            } else if ((flag & 0xC0) === 0xC0 ){ //110
                unicode = (utf8Bytes[pos] & 0x3F) << 6;
                unicode |= (utf8Bytes[pos+1] & 0x3F);
                unicodeStr+= String.fromCharCode(unicode) ;
                pos += 2;

            } else{
                unicodeStr+="?";
                pos += 1;
            }
        }
        return unicodeStr;
    }
    var ShpType = {
        SHAPE_UNKNOWN : -1,//Unknow Shape Type (for internal use) 
        SHAPE_NULL : 0,//ESRI Shapefile Null Shape shape type.
        SHAPE_POINT : 1,//ESRI Shapefile Point Shape shape type.
        SHAPE_POLYLINE : 3,//ESRI Shapefile PolyLine Shape shape type.
        SHAPE_POLYGON : 5,//ESRI Shapefile Polygon Shape shape type.
        SHAPE_MULTIPOINT : 8,//ESRI Shapefile Multipoint Shape shape type (currently unsupported).
        SHAPE_POINTZ : 11,//ESRI Shapefile PointZ Shape shape type.
        SHAPE_POLYLINEZ : 13,//ESRI Shapefile PolylineZ Shape shape type(currently unsupported).
        SHAPE_POLYGONZ : 15,//ESRI Shapefile PolygonZ Shape shape type (currently unsupported).
        SHAPE_MULTIPOINTZ : 18,//ESRI Shapefile MultipointZ Shape shape type (currently unsupported).
        SHAPE_POINTM : 21,//ESRI Shapefile PointM Shape shape type
        SHAPE_POLYLINEM : 23,//ESRI Shapefile PolyLineM Shape shape type (currently unsupported).
        SHAPE_POLYGONM : 25,// ESRI Shapefile PolygonM Shape shape type (currently unsupported).
        SHAPE_MULTIPOINTM : 28,//ESRI Shapefile MultiPointM Shape shape type (currently unsupported).
        SHAPE_MULTIPATCH : 31//ESRI Shapefile MultiPatch Shape shape type (currently unsupported).
    };
    var ShapeFieldType = {
        SHAPE_B : 66,
        SHAPE_C : 67,
        SHAPE_D : 68,
        SHAPE_F : 70,
        SHAPE_G : 71,
        SHAPE_N : 78,
        SHAPE_I : 73,
        SHAPE_L : 76,
        SHAPE_M : 77,
        SHAPE_T : 84,
        SHAPE_P : 80,
        SHAPE_Y : 89 
    }
    var LDID = {
        UTF_16 : 79,
        UTF_8 : 0,
        ASNI : 77,//for gb2312
    }
    function arcgisPoint() {
        this.spatialReference={
            "wkid":4326
        }
        this.x = 0.0;
        this.y = 0.0;
        this.type="point";
    }
    function arcgisPolygon() {
        this.spatialReference={
            "wkid":4326
        }
        this.rings = [];
        this.type="polygon";
    }
    function arcgisPolyline() {
        this.spatialReference={
            "wkid":4326
        }
        this.paths = [];
        this.type="polyline";
    }
    
    return ShpFile;
}))