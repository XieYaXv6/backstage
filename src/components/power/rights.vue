<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片 -->
    <el-card>
        <el-table :data="rightslist" border stripe>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="权限名称" prop='authName'></el-table-column>
            <el-table-column label="路径" prop='path'></el-table-column>
            <el-table-column label="权限等级" prop='level'>
                <template slot-scope="scope">
                    <el-tag v-if="scope.row.level==='0'">一级权限</el-tag>
                    <el-tag v-else-if="scope.row.level==='1'" type="success">二级权限</el-tag>
                    <el-tag v-else type="warning">三级权限</el-tag>
                </template>
            </el-table-column>

        </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rightslist: [],
    };
  },
  created() {
    this.getrightlist();
  },
  methods: {
    async getrightlist() {
      const { data: res } = await this.$http.get("rights/list");
      if(res.meta.status!==200){
          return this.$message.error('获取权限列表失败！')
      }
      this.rightslist=res.data
      //console.log(this.rightslist)
    },
  },
};
</script>

<style lang='less' scoped>
</style>