<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <!-- 头部搜索添加 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryinfo.query" clearable @clear="getgoodlist">
            <el-button slot="append" icon="el-icon-search" @click="getgoodlist"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary"  @click="goaddpage">添加商品</el-button>
        </el-col>
      </el-row>

      <el-table :data="goodlist" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格" prop="goods_price" width="95px"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="70px"></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="140px">
            <template slot-scope="scope">{{scope.row.add_time*1000|dateformat}}</template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removebyid(scope.row.goods_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryinfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryinfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      queryinfo: {
        query: "",
        pagenum: 1,
        pagesize: 10,
      },
      goodlist: [],
      total: 0,
    };
  },
  created() {
    this.getgoodlist();
  },
  methods: {
    async getgoodlist() {
      const { data: res } = await this.$http.get("goods", {
        params: this.queryinfo,
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品列表失败！");
      }
      this.$message.success("获取商品列表成功！");
      this.goodlist = res.data.goods;
      this.total = res.data.total;
      //console.log(res.data);
    },
    //监听每页显示多少条数据
    handleSizeChange(newsize){
        this.queryinfo.pagesize=newsize
        this.getgoodlist()
    },
    //监听切换到的页数
    handleCurrentChange(newpage){
        this.queryinfo.pagenum=newpage
        this.getgoodlist()
    },
    //删除
    async removebyid(id){
        const result = await this.$confirm(
        "此操作将永久删除该商品, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => {
        return err;
      });
      if (result !== "confirm") {
        return this.$message.info("已取消删除");
      }
        //console.log(id)
        const {data:res}=await this.$http.delete(`goods/${id}`)
        if(res.meta.status!==200){
            return this.$message.error('删除失败！')
        }
        this.$message.success('删除成功！')
        this.getgoodlist()

    },
    goaddpage(){
        this.$router.push('/goods/add')
    }

  },
};
</script>

<style  lang='less' scoped>
</style>